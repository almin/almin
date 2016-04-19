// LICENSE : MIT
"use strict";
const assert = require("assert");
import StoreGroup from "./StoreGroup";
import CoreEventEmitter from "../CoreEventEmitter";
/*
StoreGroup

- must have `#onChange((stores) => {}): void`
- must have `#getState(): Object`
- may have `#release(): void`

 */
export default class StoreGroupValidator {
    /**
     * validate the instance is StoreGroup-like object
     * {@link Context} treat StoreGroup like object as StoreGroup.
     * @param {StoreGroup|Object} storeGroup
     */
    static validateInstance(storeGroup) {
        assert(storeGroup !== undefined, "store should not be undefined");
        assert(storeGroup instanceof CoreEventEmitter, "storeGroup should inherit CoreEventEmitter");
        assert(typeof storeGroup.onChange === "function", "StoreGroup should have #onChange method");
        assert(typeof storeGroup.getState === "function", "StoreGroup should have #getState method");
        // #release is optional
        assert(typeof storeGroup.release === "undefined" || typeof storeGroup.release === "function",
            "StoreGroup may have #release method");
    }

}