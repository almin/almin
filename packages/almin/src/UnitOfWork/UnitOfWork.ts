// MIT © 2017 azu
import { EventEmitter } from "events";
import { Payload } from "../payload/Payload";
import { DispatcherPayloadMeta, DispatcherPayloadMetaImpl } from "../DispatcherPayloadMeta";

/**
 * Unit of work committing target
 */
export interface Committable {
    commit(payload: Payload, meta: DispatcherPayloadMetaImpl): void;
}

export class UnitOfWork extends EventEmitter {
    private transactionalEvents: [Payload, DispatcherPayloadMetaImpl][];
    private committable: Committable;
    private isDisposed: boolean;

    /**
     * @param {Committable} committable it is often StoreGroup
     */
    constructor(committable: Committable) {
        super();
        this.transactionalEvents = [];
        this.committable = committable;
        this.isDisposed = false;
    }

    get size() {
        return this.transactionalEvents.length;
    }

    addPayload(payload: Payload, meta: DispatcherPayloadMeta) {
        this.transactionalEvents.push([payload, meta]);
        this.emit("ON_ADD_NEW_EVENT", payload);
    };

    onNewPayload(handler: (event: [Payload, DispatcherPayloadMetaImpl]) => void) {
        this.on("ON_ADD_NEW_EVENT", handler);
    }

    commit() {
        if (this.isDisposed) {
            throw new Error("already closed this transaction");
        }
        this.transactionalEvents.forEach(([payload, meta]) => {
            this.committable.commit(payload, meta);
        });
        this.prune();
    };

    prune() {
        this.transactionalEvents.length = 0;
    }

    release() {
        this.transactionalEvents.length = 0;
        this.isDisposed = true;
        this.removeAllListeners();
    }
}
