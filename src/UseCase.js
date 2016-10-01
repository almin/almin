// LICENSE : MIT
"use strict";
import Dispatcher from "./Dispatcher";
import UseCaseContext from "./UseCaseContext";
import {ActionTypes} from "./Context";
/**
 * @type {string}
 * @private
 */
export let defaultUseCaseName = "<Anonymous-UseCase>";
/**
 * UseCase class
 * @public
 */
export default class UseCase extends Dispatcher {
    /**
     * return true if the `v` is UseCase .
     * @param {*} v
     * @returns {boolean}
     * @public
     */
    static isUseCase(v) {
        if (v instanceof UseCase) {
            return true;
        } else if (typeof v === "object" && typeof v.execute === "function") {
            return true;
        }
        return false
    }

    constructor() {
        super();
        /**
         * @type {string} default: UseCase name
         */
        this.name = this.displayName || this.constructor.name || defaultUseCaseName;
        /**
         * @type {string} UseCase name
         */
        this.useCaseName = this.constructor.name;

    }

    execute() {
        throw new TypeError(`should be overwrite ${this.constructor.name}#execute()`);
    }

    /**
     * getter to get context of UseCase
     * @returns {UseCaseContext} the UseCaseContext has `execute()` method
     * @public
     */
    get context() {
        return new UseCaseContext(this);
    }

    /**
     * called the `errorHandler` with error when error is occurred.
     * @param {function(error: Error)} errorHandler
     * @returns {function(this:Dispatcher)}
     * @public
     */
    onError(errorHandler) {
        return this.onDispatch(payload => {
            if (payload.type === ActionTypes.ON_ERROR) {
                errorHandler(payload.error);
            }
        });
    }

    /**
     * payload object that is dispatched when UseCase is failing or `throwError`.
     * @typedef {Object} UseCaseErrorPayload
     * @property {string} type The event type of error.
     * @property {UseCase} useCase useCase instance
     * @property {error} error error object that is thrown from UseCase
     * @public
     */
    /**
     * throw error event
     * you can use it instead of `throw new Error()`
     * this error event is caught by dispatcher.
     * @param {Error} error
     * @public
     */
    throwError(error) {
        /**
         * @type {UseCaseErrorPayload}
         */
        const payload = {
            type: ActionTypes.ON_ERROR,
            useCase: this,
            error: error
        };
        this.dispatch(payload);
    }
}