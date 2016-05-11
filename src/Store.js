// LICENSE : MIT
"use strict";
const assert = require("assert");
import Dispatcher from "./Dispatcher";
import UseCase from "./UseCase";
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
 */
export default class Store extends Dispatcher {
    /**
     * return true if the `v` is store.
     * @param {*} v
     * @returns {boolean}
     * @public
     */
    static isStore(v) {
        if (v instanceof Store) {
            return true;
        } else if (typeof v === "object" && typeof v.getState === "function" && v.onChange === "function") {
            return true;
        }
        return false
    }

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
     */
    getState(prevState) {
        throw new Error(this.name + " should be implemented Store#getState(): Object");
    }

    /**
     * invoke `handler` if the `useCase` throw error.
     * @param {UseCase} useCase
     * @param {Function} handler
     * @returns {Function} call the function and release handler
     * @public
     */
    onUseCaseError(useCase, handler) {
        assert(UseCase.isUseCase(useCase), "useCase should be instance of UseCase: " + useCase);
        this.onDispatch(({type, error}) => {
            if (type === `${this.useCaseName}:error`) {
                handler(error);
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
    onChange(cb) {
        this.on(STATE_CHANGE_EVENT, cb);
        return this.removeListener.bind(this, STATE_CHANGE_EVENT, cb);
    }

    /**
     * emit "change" event to subscribers
     * @public
     */
    emitChange() {
        this.emit(STATE_CHANGE_EVENT);
    }
};