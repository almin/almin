// LICENSE : MIT
"use strict";
/**
 * DispatcherPayloadMeta is a meta object for dispatcher.
 * This object is always created by System(= Almin).
 * The user can get this meta object together with dispatched `payload` object
 * @example
 * context.onDispatch((payload, meta) => {});
 */
export default class DispatcherPayloadMeta {
    /**
     * @param {UseCase} [useCase]
     * @param {UseCase|Dispatcher} [parentDispatcher]
     */
    constructor({
        useCase,
        parentDispatcher
    } = {}) {
        /**
         * @param {UseCase|Dispatcher|null|undefined} useCase A reference to the useCase/dispatcher to which the payload was originally dispatched.
         * @public
         */
        this.useCase = useCase;
        /**
         * Parent dispatcher/useCase of the `this.useCase`,
         * @param {UseCase|Dispatcher|null|undefined}
         * @public
         */
        this.parentDispatcher = parentDispatcher;
        /**
         *  timeStamp is created time of the meta.
         * @type {number}
         * @public
         */
        this.timeStamp = Date.now();
    }
}