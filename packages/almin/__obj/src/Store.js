// LICENSE : MIT
"use strict";
import { Dispatcher } from "./Dispatcher";
import { shallowEqual } from "shallow-equal-object";
const STATE_CHANGE_EVENT = "STATE_CHANGE_EVENT";
/**
 * @type {string}
 * @private
 */
export const defaultStoreName = "<Anonymous-Store>";
/**
 * Store hold the state of your application.
 *
 * Typically, `Store` has a parts of the whole state tree of your application.
 * `StoreGroup` is the the whole state tree.
 *
 * It means that `StoreGroup` is a collection of `Store` instances.
 *
 * A UseCase `dispatch(payload)` and `Store` can receive it.
 *
 * ### Abstraction Code
 *
 * This is imagination code. (It will not work.)
 *
 * ```js
 * abcUseCase
 *  .dispatch({
 *      type: "ABC",
 *      value: "value"
 *  });
 *
 * abcStore
 *  .onDispatch(({ type, value }) => {
 *      console.log(type);  // "ABC"
 *      console.log(value); // 42
 *  });
 * ```
 *
 * ### Example
 *
 * To implement store, you have to inherit `Store` class.
 *
 * ```js
 * class YourStore extends Store {
 *    constructor(){
 *       super();
 *       this.state = {
 *          foo : "bar"
 *       };
 *    }
 *    getState(){
 *      return {
 *          yourStore: this.state
 *      };
 *    }
 * }
 * ```
 */
export class Store extends Dispatcher {
    /**
     * Constructor not have arguments.
     */
    constructor() {
        super();
        const own = this.constructor;
        /**
         * @type {string} Store name
         */
        this.name = own.displayName || own.name || defaultStoreName;
    }
    /**
     * Return true if the `v` is store like.
     */
    static isStore(v) {
        if (v instanceof Store) {
            return true;
        }
        else if (typeof v === "object" && typeof v.getState === "function" && typeof v.onChange === "function") {
            return true;
        }
        return false;
    }
    /**
     * Update own state property if needed.
     * If `this.shouldStateUpdate(currentState, newState)` return true, update `this.state` property with `newState`.
     */
    setState(newState) {
        if (this.shouldStateUpdate(this.state, newState)) {
            this.state = newState;
        }
    }
    /**
     * If the prev/next state is difference, should return true.
     *
     * Use Shallow Object Equality Test by default.
     * <https://github.com/sebmarkbage/ecmascript-shallow-equal>
     */
    shouldStateUpdate(prevState, nextState) {
        return !shallowEqual(prevState, nextState);
    }
    /**
     * Subscribe change event of the store.
     * When `Store#emitChange()` is called, then call subscribers.
     *
     * ### Example
     *
     * ```js
     * store.onChange((changingStores) => {
     *    console.log(changingStores); // [store]
     * });
     *
     * store.emitChange();
     * ```
     */
    onChange(cb) {
        this.on(STATE_CHANGE_EVENT, cb);
        return this.removeListener.bind(this, STATE_CHANGE_EVENT, cb);
    }
    /**
     * Emit "change" event to subscribers.
     * If you want to notify changing ot tha store, call `Store#emitChange()`.
     */
    emitChange() {
        this.emit(STATE_CHANGE_EVENT, [this]);
    }
    /**
     * Release all event handlers
     */
    release() {
        this.removeAllListeners(STATE_CHANGE_EVENT);
    }
}
// Implement assertion
Store.prototype.getState = function () {
    throw new Error(`${this.name} should be implemented Store#getState(): Object`);
};
