// LICENSE : MIT
"use strict";

import ObjectAssign from "object-assign";
import * as assert from "assert";
import LRU from "lru-map-like";

import { Dispatcher } from "../Dispatcher";
import { Store } from "../Store";
import { StoreGroupValidator } from "./StoreGroupValidator";
import { StoreLike } from "../StoreLike";
import { raq } from "./raq";

const CHANGE_STORE_GROUP = "CHANGE_STORE_GROUP";

/**
 * StoreGroup is a collection of Store.
 *
 * ## Purposes of StoreGroup
 *
 * - Throttling change events of Store for UI updating.
 * - A central manager of stores.
 *
 * StoreGroup has event queue system.
 * It means that StoreGroup thin out change events of stores.
 *
 * If you want to know all change events, and directly use `store.onChange()`.
 */
export class StoreGroup extends Dispatcher implements StoreLike {
    /**
     * @private definitions
     */
    private _releaseHandlers: Array<Function>;
    private _currentChangingStores: Array<Store>;
    private _previousChangingStores: Array<Store>;
    private _stateCache: LRU<Store, any>;
    private _isAnyOneStoreChanged: boolean;
    private _stores: Array<Store>;

    /**
     * Initialize `StoreGroup` with `Store` instances
     *
     * ### Example
     *
     * ```js
     * const aStore = new AStore();
     * const bStore = new BStore();
     * // StoreGroup is a group of aStore and bStore.
     * const storeGroup = new StoreGroup([aStore, bStore]);
     * ```
     */
    constructor(stores: Array<Store>) {
        super();
        StoreGroupValidator.validateStores(stores);
        /**
         * callable release handlers
         * @private
         */
        this._releaseHandlers = [];

        /**
         * array of store that emit change in now!
         * this array is temporary cache in changing the StoreGroup
         * @type {Store[]}
         * @private
         */
        this._currentChangingStores = [];
        this._previousChangingStores = [];
        /**
         * @type {Store[]}
         */
        this._stores = stores;
        // listen onChange of each store.
        this._stores.forEach(store => this._registerStore(store));

        /**
         * LRU Cache for Store and State
         * @type {LRU}
         * @private
         */
        this._stateCache = new LRU<Store, any>(100);
    }

    /**
     * A collection of stores in the StoreGroup.
     */
    get stores(): Array<Store> {
        return this._stores;
    }

    /**
     * Return the state object that merge each stores's state
     *
     * Related: `Context#onChange` use `StoreGroup#getState()`
     *
     * ### Example
     *
     * ```js
     * const storeGroup = new StoreGroup([aStore, bStore]);
     * console.log(aStore.getState()); // { aState: aState }
     * console.log(bStore.getState()); // { bState: bState }
     * // StoreGroup#getState merge these states.
     * const state = storeGroup.getState();
     * console.log(state); // { aState: aState, bState: aState }
     *
     * ```
     */
    getState<T>(): T {
        const stateMap = this._stores.map(store => {
            /* Why record nextState to `_storeValueMap`.
             It is for Use Store's getState(prevState) implementation.

             @example

             class ExampleStore extends Store {
                 getState(prevState = initialState) {
                    return {
                        NextState: this.state
                    };
                 }
             }
             */
            const prevState = this._stateCache.get(store);
            // if the `store` is not changed in previous, return cached state
            // Otherwise, the store is changed return new Store#getState()
            if (prevState && this._previousChangingStores.indexOf(store) === -1) {
                return prevState;
            }
            const nextState = store.getState(prevState);
            if (process.env.NODE_ENV !== "production") {
                assert.ok(typeof nextState == "object", `${store}: ${store.name}.getState() should return Object.
e.g.)

 class ExampleStore extends Store {
     getState(prevState) {
         return {
            StateName: state
         };
     }
 }
 
Then, use can access by StateName.

StoreGroup#getState()["StateName"]// state

`);
            }
            this._stateCache.set(store, nextState);
            return nextState;
        });
        return ObjectAssign({}, ...stateMap);
    }

    /**
     * register store and listen onChange.
     * If you release store, and do call {@link release} method.
     * @param {Store} store
     * @private
     */
    private _registerStore(store: Store): void {
        // if anyone store is changed, will call `emitChange()`.
        const releaseOnChangeHandler = store.onChange(() => {
            // true->false, prune previous cache
            if (this._isAnyOneStoreChanged === false) {
                this._prunePreviousChangingCache();
            }
            this._isAnyOneStoreChanged = true;
            // if the same store emit multiple, emit only once.
            const isStoreAlreadyChanging = this._currentChangingStores.indexOf(store) !== -1;
            if (isStoreAlreadyChanging) {
                return;
            }
            // add change store list in now
            // it is released by `StoreGroup#emitChange`
            this._currentChangingStores.push(store);
            raq(() => {
                // `requestEmitChange()` is for pushing `emitChange()` to queue.
                this._requestEmitChange();
            });
        });
        // Implementation Note:
        // Delegate dispatch event to Store from StoreGroup 
        // Dispatcher -> StoreGroup -> Store
        const releaseOnDispatchHandler = this.pipe(store);
        // add release handler
        this._releaseHandlers = this._releaseHandlers.concat([releaseOnChangeHandler, releaseOnDispatchHandler]);
    }

    /**
     * release previous changing stores
     */
    private _prunePreviousChangingCache(): void {
        this._previousChangingStores.length = 0;
        this._currentChangingStores.length = 0;
    }

    /**
     * emitChange if its needed.
     * Implementation Note:
     * - Anyone registered store emitChange, then set `this._isChangedStore` true.
     * - if `this._isChangedStore === true`, then {@link emitChange}().
     */
    private _requestEmitChange(): void {
        if (!this._isAnyOneStoreChanged) {
            return;
        }
        this._isAnyOneStoreChanged = false; // reset changed state
        this.emitChange();
    }

    /**
     * Emit change Event to subscribers.
     * It is same with `Store#emitChange()`
     */
    emitChange(): void {
        this._previousChangingStores = this._currentChangingStores.slice();
        // release ownership  of changingStores from StoreGroup
        // transfer ownership of changingStores to other
        this.emit(CHANGE_STORE_GROUP, this._previousChangingStores);
    }

    /**
     * subscribe changes of the store group.
     * It is same with `Store#onChage()`
     */
    onChange(handler: (stores: Array<Store>) => void): () => void {
        this.on(CHANGE_STORE_GROUP, handler);
        const releaseHandler = this.removeListener.bind(this, CHANGE_STORE_GROUP, handler);
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * Release all events handler on StoreGroup.
     * You can call this when no more needed the StoreGroup.
     */
    release(): void {
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
        this._stateCache.clear();
    }
}
