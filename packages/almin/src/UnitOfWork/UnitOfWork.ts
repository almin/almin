// MIT © 2017 azu
import { StoreGroup } from "../UILayer/StoreGroup";
import { EventEmitter } from "events";
import { Payload } from "../payload/Payload";


export class UnitOfWork extends EventEmitter {
    private transactionalEvents: Payload[];
    private storeGroup: StoreGroup<any>;
    private isDisposed: boolean;

    constructor(storeGroup: StoreGroup<any>) {
        super();
        this.transactionalEvents = [];
        this.storeGroup = storeGroup;
        this.isDisposed = false;
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
            this.storeGroup.commit(event);
        });
        this.prune();
    };

    prune() {
        this.transactionalEvents.length = 0;
    }

    close() {
        this.transactionalEvents.length = 0;
        this.isDisposed = true;
        this.removeAllListeners();
    }
}
