// LICENSE : MIT
"use strict";
const assert = require("assert");
import Dispatcher from "./Dispatcher";
import UseCase from "./UseCase";
const STATE_CHANGE_EVENT = "STATE_CHANGE_EVENT";
/**
 * A UseCase `dispatch` {@link key} with {@link args} and receive the {@link key} with {@link args}
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
 */

export default class Store extends Dispatcher {
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
        this.name = this.displayName || this.constructor.name;
    }

    /**
     * implement return state object
     * @param {Object} prevState
     * @return {Object} nextState
     */
    getState(prevState) {
        throw new Error(this.name + " should be implemented Store#getState(): Object");
    }

    /**
     * invoke {@link handler} if the {@link UseCase} throw error.
     * @param {UseCase} useCase
     * @param {Function} handler
     * @returns {Function} return un-listen function
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
     * @returns {Function} return unbind function
     */
    onChange(cb) {
        this.on(STATE_CHANGE_EVENT, cb);
        return this.removeListener.bind(this, STATE_CHANGE_EVENT, cb);
    }

    /**
     * emit change event to subscribers
     */
    emitChange() {
        this.emit(STATE_CHANGE_EVENT);
    }
};