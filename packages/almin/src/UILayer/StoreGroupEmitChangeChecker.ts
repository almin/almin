// MIT © 2017 azu
import { MapLike } from "map-like";
import { Store } from "../Store";
import { shouldStateUpdate } from "./StoreGroupUtils";

// ====
// Note: This module doesn't show warning in production
// ====
/**
 * Warning: check immutability state between prevState and nextState.
 * If the store call `Store#emitChange()` and the state of store is not changed, show warning
 * https://github.com/almin/almin/issues/151
 * https://github.com/almin/almin/pull/205
 */
const warningIfChangingStoreIsNotImmutable = (store: Store, prevState: any, nextState: any) => {
    // If the store emitChange, check immutability
    const isStateChanged = shouldStateUpdate(store, prevState, nextState);
    if (isStateChanged) {
        return;
    }
    console.error(
        `Warning(Store): ${store.name} does call emitChange(). 
But, this store's state is not changed.
Store's state should be immutable value.
Prev State:`,
        prevState,
        `Next State:`,
        nextState
    );
};
/**
 * Warning: check immutability of the `store`'s state
 * If the store's `state` property is directly modified, show warning message.
 * We recommenced to use `Store#setState` for updating state of store.
 * https://github.com/almin/almin/issues/151
 */
const warningIfStatePropertyIsModifiedDirectly = (store: Store, prevState: any, nextState: any) => {
    // If the store return **changed** state, but shouldStateUpdate return false.
    // This checker aim to find updating that is not reflected to UI.
    if (!store.hasOwnProperty("state")) {
        return;
    }
    // store.state is not same with getState value
    // It means `store.state` is not related with getState
    if (store.state !== nextState) {
        return;
    }
    const isStateReferenceReplaced = prevState !== nextState;
    const isStateUpdated = shouldStateUpdate(store, prevState, nextState);
    const isStateReplacedButShouldNotUpdate = isStateReferenceReplaced && !isStateUpdated;
    if (isStateReplacedButShouldNotUpdate) {
        console.error(
            `Warning(Store): ${
                store.name
            }#state property is replaced by different value, but this change **does not** reflect to view.
Because, ${store.name}#shouldStateUpdate(prevState, store.state) has returned **false**.

It means that the variance is present between ${store.name}#state property and shouldStateUpdate.
You should update the state vis \`Store#setState\` method.

For example, you should update the state by following:

    this.setState(newState);
    
    // OR

    if(this.shouldStateUpdate(this.state, newState)){
        this.state = newState;
    }
`,
            "prevState",
            prevState,
            "nextState",
            nextState
        );
    }
};

/**
 * Check the usage of Store#emitChange.
 * If the store call `Store#emitChange()` but the state of store is not changed, show warning.
 * https://github.com/almin/almin/issues/151
 * https://github.com/almin/almin/pull/205
 */
export class StoreGroupEmitChangeChecker {
    // store/state cache map for emitChange
    private _emitChangeStateCacheMap = new MapLike<Store<any>, any>();

    /**
     * mark `store` as `emitChange`ed store in a UseCase life-cycle
     *
     * Warning: Show warning message if the `store`'s state is not changed.
     */
    mark(store: Store, cachedPrevState: any, nextState: any) {
        // prevState for emitChange.
        const previousEmitChangedState = this._emitChangeStateCacheMap.get(store);
        const prevState = previousEmitChangedState || cachedPrevState;
        // Check immutability of state
        warningIfChangingStoreIsNotImmutable(store, prevState, nextState);
        this._emitChangeStateCacheMap.set(store, nextState);
    }

    /**
     * Is this `store` marked by the checker?
     */
    isMarked(store: Store): boolean {
        return this._emitChangeStateCacheMap.has(store);
    }

    /**
     * unMark `store` at end of a useCase life-cycle
     * When the nextState is confirmed, should call it.
     */
    unMark(store: Store) {
        this._emitChangeStateCacheMap.delete(store);
    }

    /**
     * Warning: Show warning message if the `store`'s state is modified directly.
     * We recommenced to use `Store#setState` for updating state of store.
     *
     * ## Example
     *
     * ```js
     * class MyStore extends Store {
     *  receivePayload(){
     *      // direct modified
     *      this.state = { value: "next" }
     *  }
     * }
     * ```
     */
    warningIfStatePropertyIsModifiedDirectly(store: Store, prevState: any, nextState: any) {
        // TODO: We could not support mixed updating style for store.
        // If `Store#emitChange` and directly update state in `receivePayload` is mixed,
        // we can't validate correctness of the state
        if (!this.isMarked(store)) {
            warningIfStatePropertyIsModifiedDirectly(store, prevState, nextState);
        }
    }
}
