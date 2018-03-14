// LICENSE : MIT
"use strict";
import { Dispatcher } from "../Dispatcher";
import { assertOK } from "../util/assert";
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
        assertOK(storeGroup !== undefined, "store should not be undefined");
        assertOK(Dispatcher.isDispatcher(storeGroup), "storeGroup should be inherited Dispatcher");
        assertOK(typeof storeGroup.onChange === "function", "StoreGroup should have #onChange method");
        assertOK(typeof storeGroup.getState === "function", "StoreGroup should have #getState method");
        // #release is optional
        assertOK(
            typeof storeGroup.release === "undefined" || typeof storeGroup.release === "function",
            "StoreGroup may have #release method"
        );
    }
}
