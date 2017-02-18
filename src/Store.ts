// LICENSE : MIT
"use strict";
import Dispatcher from "./Dispatcher";
import DispatcherPayloadMeta from "./DispatcherPayloadMeta";
import Payload from "./payload/Payload";
import ErrorPayload from "./payload/ErrorPayload";
const STATE_CHANGE_EVENT = "STATE_CHANGE_EVENT";
/**
 * A UseCase `dispatch(payload)` and subscribers of the dispatcher are received the payload.
 *
 * @example
 *
 * abcUseCase
 *  .dispatch({
 *      type: "ABC",
 *      value: "value"
 *  })
 *
 * abcStore
 *  .onDispatch(({ type, value }) => {
 *      console.log(type);  // "ABC"
 *      console.log(value); // 42
 *  });
 *
 * @public
 */

/**
 * @type {string}
 * @private
 */
export let defaultStoreName = "<Anonymous-Store>";
/**
 * Store class
 * @public
 */
abstract class Store extends Dispatcher {
    /**
     * return true if the `v` is store.
     * @param {*} v
     * @returns {boolean}
     * @public
     */
    static isStore(v: any): v is Store {
        if (v instanceof Store) {
            return true;
        } else if (typeof v === "object" && typeof v.getState === "function" && v.onChange === "function") {
            return true;
        }
        return false
    }

    name: string;
    displayName: string;

    constructor() {
        super();
        /**
         * @type {string} Store name
         */
        this.name = this.displayName || this.constructor.name || defaultStoreName;
    }

    /**
     * should be overwrite. return state object
     * @param {Object} prevState
     * @return {Object} nextState
     * @public
     * 
     * FIXME: mark this as `abstract` property.
     */
    getState<T>(_prevState: T): T {
        throw new Error(this.name + " should be implemented Store#getState(): Object");
    }

    /**
     * invoke `handler` when UseCase throw error events.
     * @param {function(payload: Payload, meta: DispatcherPayloadMeta)} handler
     * @returns {Function} call the function and release handler
     * @public
     * @example
     * store.onError((payload, meta) => {
     *  const useCase = meta.useCase;
     *  if(useCase instanceof AUseCase){
     *      console.log(payload.error);
     *  }
     * }):
     * @deprecated
     */
    onError(handler: (payload: Payload, meta: DispatcherPayloadMeta) => void): () => void {
        console.warn("Store#onError is deprecated. Please use Store#onDispatch.");
        return this.onDispatch((payload, meta) => {
            if (payload.type === ErrorPayload.Type) {
                handler(payload, meta);
            }
        });
    }

    /**
     * subscribe change event of the state(own).
     * if emit change event, then call registered event handler function
     * @param {Function} cb
     * @returns {Function} call the function and release handler
     * @public
     */
    onChange(cb: Function): () => void {
        this.on(STATE_CHANGE_EVENT, cb);
        return this.removeListener.bind(this, STATE_CHANGE_EVENT, cb);
    }

    /**
     * emit "change" event to subscribers
     * @public
     */
    emitChange(): void {
        this.emit(STATE_CHANGE_EVENT);
    }
}

export default Store;