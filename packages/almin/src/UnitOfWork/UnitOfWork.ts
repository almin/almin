// MIT © 2017 azu
import { StoreGroup } from "../UILayer/StoreGroup";
import { Payload } from "../payload/Payload";
import { EventEmitter } from "events";

// already done Payload
export class Event extends Payload {

}

export class UnitOfWork extends EventEmitter {
    private transactionalEvents: Event[];
    private storeGroup: StoreGroup<any>;
    private isDisposed: boolean;

    constructor(storeGroup: StoreGroup<any>) {
        super();
        this.transactionalEvents = [];
        this.storeGroup = storeGroup;
        this.isDisposed = false;
    }

    addEvent(event: Event) {
        this.transactionalEvents.push(event);
        this.emit("ON_ADD_NEW_EVENT", event);
    };

    onNewEvent(handler: (event: Event) => void) {
        this.on("ON_ADD_NEW_EVENT", handler);
    }

    commit() {
        if (this.isDisposed) {
            throw new Error("already closed this transaction");
        }
        this.transactionalEvents.forEach((event) => {
            try {
                this.storeGroup.commit(event);
            } catch (error) {
                this.close();
            }
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
