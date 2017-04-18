// LICENSE : MIT
"use strict";
const assert = require("assert");
import { Store } from "../Store";
import { Dispatcher } from "../Dispatcher";
import { StoreLike } from "../StoreLike";
/*
 StoreGroup

 - must have `#onChange((stores) => {}): void`
 - must have `#getState(): Object`
 - may have `#release(): void`

 */
export class StoreGroupValidator {
    /**
     * validate stores in StoreGroup
     * @param {Store[]} stores
     */
    static validateStores(stores: Array<Store>): void | never {
        stores.forEach(store => {
            assert.ok(Store.isStore(store), `${store} should be instance of Store`);
            assert.ok(typeof store.getState === "function", `${store} should implement getState() method.
StoreGroup merge values of store*s*.`);
            const storeName = store.name;
            assert.ok(storeName, `${store} should have name property value.`);
        });
    }

    /**
     * validate the instance is StoreGroup-like object
     * {@link Context} treat StoreGroup like object as StoreGroup.
     * @param {*|StoreGroup|Store} storeGroup
     */
    static validateInstance(storeGroup: any | StoreLike): void | never {
        assert.ok(storeGroup !== undefined, "store should not be undefined");
        assert.ok(Dispatcher.isDispatcher(storeGroup), "storeGroup should inherit CoreEventEmitter");
        assert.ok(typeof storeGroup.onChange === "function", "StoreGroup should have #onChange method");
        assert.ok(typeof storeGroup.getState === "function", "StoreGroup should have #getState method");
        // #release is optional
        assert.ok(typeof storeGroup.release === "undefined" || typeof storeGroup.release === "function",
            "StoreGroup may have #release method");
    }

}
