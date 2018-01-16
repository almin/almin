"use strict";
import { Payload } from "./Payload";
import { StoreLike } from "../StoreLike";

/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "__ALMIN_STORE_IS_CHANGED__";

/**
 * ChangePayload is that represent a store is changed.
 */
export class StoreChangedPayload implements Payload {
    type = TYPE;
    store: StoreLike<any>;

    constructor(store: StoreLike<any>) {
        this.store = store;
    }
}

export function isStoreChangedPayload(v: Payload): v is StoreChangedPayload {
    return v.type === TYPE;
}
