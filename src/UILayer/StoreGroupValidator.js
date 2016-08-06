// LICENSE : MIT
"use strict";
const assert = require("assert");
import Store, {defaultStoreName} from "../Store";
import StoreGroup from "./StoreGroup";
import Dispatcher from "../Dispatcher";
/*
 StoreGroup

 - must have `#onChange((stores) => {}): void`
 - must have `#getState(): Object`
 - may have `#release(): void`

 */
export default class StoreGroupValidator {
    /**
     * validate stores in StoreGroup
     * @param {Store[]} stores
     */
    static validateStores(stores) {
        stores.forEach(store => {
            assert(Store.isStore(store), `${store} should be instance of Store`);
            assert(typeof store.getState === "function", `${store} should implement getState() method.
StoreGroup merge values of store*s*.`);
            const storeName = store.name;
            assert(storeName, `${store} should have name property value.`);
        });
    }

    /**
     * validate the instance is StoreGroup-like object
     * {@link Context} treat StoreGroup like object as StoreGroup.
     * @param {*} storeGroup
     */
    static validateInstance(storeGroup) {
        assert(storeGroup !== undefined, "store should not be undefined");
        assert(Dispatcher.isDispatcher(storeGroup), "storeGroup should inherit CoreEventEmitter");
        assert(typeof storeGroup.onChange === "function", "StoreGroup should have #onChange method");
        assert(typeof storeGroup.getState === "function", "StoreGroup should have #getState method");
        // #release is optional
        assert(typeof storeGroup.release === "undefined" || typeof storeGroup.release === "function",
            "StoreGroup may have #release method");
    }

}