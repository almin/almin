// MIT © 2017 azu
import { EventEmitter } from "events";
import { Payload } from "../payload/Payload";

export interface Committable {
    commit(payload: Payload): void;
}

export class UnitOfWork extends EventEmitter {
    private transactionalEvents: Payload[];
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

    addPayload(payload: Payload) {
        this.transactionalEvents.push(payload);
        this.emit("ON_ADD_NEW_EVENT", payload);
    };

    onNewPayload(handler: (event: Event) => void) {
        this.on("ON_ADD_NEW_EVENT", handler);
    }

    commit() {
        if (this.isDisposed) {
            throw new Error("already closed this transaction");
        }
        this.transactionalEvents.forEach((event) => {
            this.committable.commit(event);
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
