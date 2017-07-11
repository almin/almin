// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { Dispatcher } from "../Dispatcher";
/*
 StoreGroup

 - must have `#onChange((stores) => {}): void`
 - must have `#getState(): Object`
 - may have `#release(): void`

 */
export class StoreGroupValidator {
    /**
     * validate the instance is StoreGroup-like object
     * Context treat StoreGroup like object as StoreGroup.
     */
    static validateInstance(storeGroup: any): void {
        assert.ok(storeGroup !== undefined, "store should not be undefined");
        assert.ok(Dispatcher.isDispatcher(storeGroup), "storeGroup should be inherited Dispatcher");
        assert.ok(typeof storeGroup.onChange === "function", "StoreGroup should have #onChange method");
        assert.ok(typeof storeGroup.getState === "function", "StoreGroup should have #getState method");
        // #release is optional
        assert.ok(
            typeof storeGroup.release === "undefined" || typeof storeGroup.release === "function",
            "StoreGroup may have #release method"
        );
    }
}
