// MIT © 2017 azu
import { EventEmitter } from "events";
import { DispatcherPayloadMeta } from "../DispatcherPayloadMeta";
import { generateNewId } from "./UnitOfWorkIdGenerator";
import { DebugId } from "../instrument/AlminAbstractPerfMarker";
import { DispatchedPayload } from "../Dispatcher";
/**
 * Commitment is a tuple of payload and meta.
 * It is a minimal unit of transaction.
 *
 * Notes: Why commitment is object?
 * commitment is collect as array at once.
 * Pass it StoreGroup directly.
 * If use ...arguments, it has spread cost by transpiler.
 *
 * It is similar reason to why use Dispatcher insteadof EventEmitter.
 */
export type Commitment = {
    payload: DispatchedPayload;
    meta: DispatcherPayloadMeta;
    debugId: DebugId;
};

/**
 * Unit of work committing target
 */
export interface Committable {
    commit(commitment: Commitment): void;
}

export class UnitOfWork extends EventEmitter {
    private commitments: Commitment[];
    private committable: Committable;
    // unique identifier
    id: string;
    isDisposed: boolean;

    /**
     * @param {Committable} committable it is often StoreGroup
     */
    constructor(committable: Committable) {
        super();
        this.id = generateNewId();
        this.commitments = [];
        this.committable = committable;
        this.isDisposed = false;
    }

    get size() {
        return this.commitments.length;
    }

    addCommitment(commitment: Commitment) {
        this.commitments.push(commitment);
        this.emit("ON_ADD_NEW_EVENT", commitment);
    }

    onAddedCommitment(handler: (commitment: Commitment) => void) {
        this.on("ON_ADD_NEW_EVENT", handler);
    }

    commit() {
        if (this.isDisposed) {
            throw new Error("already closed this transaction");
        }
        this.commitments.forEach(commitment => {
            this.committable.commit(commitment);
        });
        this.prune();
    }

    prune() {
        this.commitments.length = 0;
    }

    release() {
        this.commitments.length = 0;
        this.isDisposed = true;
        this.removeAllListeners();
    }
}
