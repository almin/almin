// LICENSE : MIT
"use strict";
const assert = require("assert");
import StoreGroup from "./UILayer/StoreGroup";
import UseCase from "./UseCase";
import UseCaseExecutor  from "./UseCaseExecutor";
import StoreGroupValidator from "./UILayer/StoreGroupValidator";
// payloads
import CompletedPayload from "./payload/CompletedPayload";
import DidExecutedPayload from "./payload/DidExecutedPayload";
import Payload from "./payload/Payload";
import ErrorPayload from "./payload/ErrorPayload";
import WillExecutedPayload from "./payload/WillExecutedPayload";
/**
 * @public
 */
export default class Context {
    /**
     * @param {Dispatcher} dispatcher
     * @param {QueuedStoreGroup|StoreGroup|Store} store store is either Store or StoreGroup
     * @public
     */
    constructor({ dispatcher, store }) {
        StoreGroupValidator.validateInstance(store);
        // central dispatcher
        this._dispatcher = dispatcher;
        this._storeGroup = store;

        /**
         * callable release handlers
         * @type {Function[]}
         * @private
         */
        this._releaseHandlers = [];
        // Implementation Note:
        // Delegate dispatch event to Store|StoreGroup from Dispatcher
        // Dispatch Flow: Dispatcher -> StoreGroup -> Store
        const releaseHandler = this._dispatcher.pipe(this._storeGroup);
        this._releaseHandlers.push(releaseHandler);
    }

    /**
     * return state value of StoreGroup.
     * @returns {*} states object of stores
     * @public
     */
    getState() {
        return this._storeGroup.getState();
    }

    /**
     * if anyone store is changed, then call onChangeHandler
     * @param {function(changingStores: Store[])} onChangeHandler
     * @return {Function} release handler function.
     * @public
     */
    onChange(onChangeHandler) {
        return this._storeGroup.onChange(onChangeHandler);
    }

    /**
     * @param {UseCase} useCase
     * @returns {UseCaseExecutor}
     * @public
     * @example
     *
     * context.useCase(UseCaseFactory.create()).execute(args);
     */
    useCase(useCase) {
        assert(UseCase.isUseCase(useCase), `It should be instance of UseCase: ${useCase}`);
        return new UseCaseExecutor({
            useCase,
            parent: null,
            dispatcher: this._dispatcher
        });
    }

    /**
     * called the {@link handler} with useCase when the useCase will do.
     * @param {function(payload: WillExecutedPayload, meta: DispatcherPayloadMeta)} handler
     * @public
     */
    onWillExecuteEachUseCase(handler) {
        const releaseHandler = this._dispatcher.onDispatch((payload, meta) => {
            if (payload.type === WillExecutedPayload.Type) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * called the `handler` with user-defined payload object when a UseCase dispatch with payload.
     * This `onDispatch` is not called at built-in event. It is filtered by Context.
     * If you want to *All* dispatched event and use listen directly your `dispatcher` object.
     * In other word, listen the dispatcher of `new Context({dispatcher})`.
     * @param {function(payload: DispatchedPayload, meta: DispatcherPayloadMeta)} handler
     * @returns {Function}
     * @public
     */
    onDispatch(handler) {
        const releaseHandler = this._dispatcher.onDispatch((payload, meta) => {
            // call handler, if payload's type is not built-in event.
            // It means that `onDispatch` is called when dispatching user event.
            if (!meta.isTrusted) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * called the `handler` with useCase when the useCase is executed..
     * @param {function(payload: DidExecutedPayload, meta: DispatcherPayloadMeta)} handler
     * @public
     */
    onDidExecuteEachUseCase(handler) {
        const releaseHandler = this._dispatcher.onDispatch((payload, meta) => {
            if (payload.type === DidExecutedPayload.Type) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * called the `handler` with useCase when the useCase is completed.
     * @param {function(payload: CompletedPayload, meta: DispatcherPayloadMeta)} handler
     * @public
     */
    onCompleteEachUseCase(handler) {
        const releaseHandler = this._dispatcher.onDispatch((payload, meta) => {
            if (payload.type === CompletedPayload.Type) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }


    /**
     * called the `errorHandler` with error when error is occurred.
     * @param {function(payload: ErrorPayload, meta: DispatcherPayloadMeta)} handler
     * @returns {function(this:Dispatcher)}
     * @public
     */
    onErrorDispatch(handler) {
        const releaseHandler = this._dispatcher.onDispatch((payload, meta) => {
            if (payload.type === ErrorPayload.Type) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * release all events handler.
     * You can call this when no more call event handler
     * @public
     */
    release() {
        if (typeof this._storeGroup === "function") {
            this._storeGroup.release();
        }
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
    }
}