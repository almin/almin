// LICENSE : MIT
"use strict";

// polyfill Object.assign
const ObjectAssign = require("object-assign");
const assert = require("assert");
const LRU = require("lru-map-like");
const CHANGE_STORE_GROUP = "CHANGE_STORE_GROUP";
import Dispatcher from "./../Dispatcher";
import Store from "./../Store";
import StoreGroupValidator from "./StoreGroupValidator";

/**
 * StoreGroup is a **UI** parts of Store.
 * StoreGroup has event queue system.
 * It means that StoreGroup thin out change events of stores.
 * If you want to know all change events, and directly use `store.onChange()`.
 * @public
 */
export default class StoreGroup extends Dispatcher {
    /**
     * Create StoreGroup
     * @param {Store[]} stores stores are instance of `Store` class
     * @public
     */
    constructor(stores) {
        super();
        StoreGroupValidator.validateStores(stores);
        /**
         * callable release handlers
         * @type {Function[]}
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
        this.stores = stores;
        // listen onChange of each store.
        this.stores.forEach(store => this._registerStore(store));

        /**
         * LRU Cache for Store and State
         * @type {LRU}
         * @private
         */
        this._stateCache = new LRU(100);
    }

    /**
     * return the state object that merge each stores's state
     * @returns {Object} merged state object
     * @public
     */
    getState() {
        const stateMap = this.stores.map(store => {
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
                assert(typeof nextState == "object", `${store}: ${store.name}.getState() should return Object.
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
    _registerStore(store) {
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
            setTimeout(() => {
                // `requestEmitChange()` is for pushing `emitChange()` to queue.
                this._requestEmitChange();
            }, 0);
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
    _prunePreviousChangingCache() {
        this._previousChangingStores.length = 0;
        this._currentChangingStores.length = 0;
    }

    /**
     * emitChange if its needed.
     * Implementation Note:
     * - Anyone registered store emitChange, then set `this._isChangedStore` true.
     * - if `this._isChangedStore === true`, then {@link emitChange}().
     */
    _requestEmitChange() {
        if (!this._isAnyOneStoreChanged) {
            return;
        }
        this._isAnyOneStoreChanged = false; // reset changed state
        this.emitChange();
    }

    /**
     * emit Change Event
     * @public
     */
    emitChange() {
        this._previousChangingStores = this._currentChangingStores.slice();
        // release ownership  of changingStores from StoreGroup
        // transfer ownership of changingStores to other
        this.emit(CHANGE_STORE_GROUP, this._previousChangingStores);
    }

    /**
     * listen changes of the store group.
     * @param {function(stores: Store[])} handler the callback arguments is array of changed store.
     * @returns {Function} call the function and release handler
     * @public
     */
    onChange(handler) {
        this.on(CHANGE_STORE_GROUP, handler);
        const releaseHandler = this.removeListener.bind(this, CHANGE_STORE_GROUP, handler);
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * release all events handler.
     * You can call this when no more call event handler
     * @public
     */
    release() {
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
        this._stateCache.clear();
    }
}