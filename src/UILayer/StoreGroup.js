// LICENSE : MIT
"use strict";
// polyfill Map
require("es6-collections");
// polyfill Object.assign
const ObjectAssign = require("object-assign");
const assert = require("assert");
const CHANGE_STORE_GROUP = "CHANGE_STORE_GROUP";
import Dispatcher from "./../Dispatcher";
import Store from "./../Store";
import StoreGroupValidator from "./StoreGroupValidator";

/**
 * StoreGroup is a **UI** parts of Store.
 * StoreGroup has event queue system.
 * It means that StoreGroup thin out change events of stores.
 * If you want to know all change events, and directly listen {@link Store.onChange}.
 */
export default class StoreGroup extends Dispatcher {
    /**
     * Create StoreGroup
     * @param {Store[]} stores stores are instance of MaterialStore
     */
    constructor(stores) {
        super();
        StoreGroupValidator.validateStores(stores);
        this._onChangeQueue = Promise.resolve();
        /**
         * callable release handlers
         * @type {Function[]}
         * @private
         */
        this._releaseHandlers = [];

        /**
         * array of store that emit change in now!
         * this array is weak-able set.
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
        this.stores.forEach(store => this.registerStore(store));

        /**
         * @type {Map}
         * @private
         */
        this._storeValueWeakMap = new WeakMap();
    }

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
            const prevState = this._storeValueWeakMap.get(store);
            if (prevState && this._previousChangingStores.indexOf(store) === -1) {
                return prevState;
            }
            const nextState = store.getState(prevState);
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
            this._storeValueWeakMap.set(store, nextState);
            return nextState;
        });
        return ObjectAssign({}, ...stateMap);
    }

    /**
     * register store and listen onChange.
     * If you release store, and do call {@link release} method.
     * @param {Store} store
     */
    registerStore(store) {
        // if anyone store is changed, will call `emitChange()`.
        const releaseOnChangeHandler = store.onChange(() => {
            this._isAnyOneStoreChanged = true;
            // if the same store emit multiple, emit only once.
            if (this._currentChangingStores.indexOf(store) !== -1) {
                return;
            }
            // add change store list in now
            // it is released by `StoreGroup#emitChange`
            this._currentChangingStores.push(store);
            this._onChangeQueue = this._onChangeQueue.then(() => {
                // `requestEmitChange()` is for pushing `emitChange()` to queue.
                this.requestEmitChange();
            }).catch(function onChangeQueueError(error) {
                setTimeout(() => {
                    throw error;
                }, 0);
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
     * emitChange if its needed.
     * Implementation Note:
     * - Anyone registered store emitChange, then set `this._isChangedStore` true.
     * - if `this._isChangedStore === true`, then {@link emitChange}().
     */
    requestEmitChange() {
        if (!this._isAnyOneStoreChanged) {
            return;
        }
        this.emitChange();
        this._isAnyOneStoreChanged = false; // reset changed state
    }

    emitChange() {
        this._previousChangingStores = this._currentChangingStores.slice();
        // transfer ownership of changingStores to other
        this.emit(CHANGE_STORE_GROUP, this._previousChangingStores);
        // release ownership  of changingStores from StoreGroup
        this._currentChangingStores.length = 0;
    }

    onChange(handler) {
        this.on(CHANGE_STORE_GROUP, handler);
        const releaseHandler = this.removeListener.bind(this, CHANGE_STORE_GROUP, handler);
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * release all events handler.
     * You can call this when no more call event handler
     */
    release() {
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
        this._storeValueWeakMap.clear();
    }
}