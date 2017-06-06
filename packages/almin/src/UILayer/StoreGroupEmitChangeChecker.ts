// MIT © 2017 azu
import MapLike from "map-like";
import { Store } from "../Store";
import { shouldStateUpdate } from "./StoreGroupUtils";

/**
 * Note: This module doesn't show warning in production
 *
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
    console.error(`Warning(Store): ${store.name} does call emitChange(). 
But, this store's state is not changed.
Store's state should be immutable value.
Prev State:`, prevState, `Next State:`, nextState
    );
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
}

export const storeGroupEmitChangeChecker = new StoreGroupEmitChangeChecker();
