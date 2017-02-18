// LICENSE : MIT
"use strict";
import * as assert from "assert";
import StoreGroup from "./UILayer/StoreGroup";
import QueuedStoreGroup from "./UILayer/QueuedStoreGroup";
import Dispatcher from "./Dispatcher";
import { DispatchedPayload } from "./Dispatcher";
import DispatcherPayloadMeta from "./DispatcherPayloadMeta";
import UseCase from "./UseCase";
import Store from "./Store";
import UseCaseExecutor  from "./UseCaseExecutor";
import StoreGroupValidator from "./UILayer/StoreGroupValidator";
// payloads
import CompletedPayload from "./payload/CompletedPayload";
import DidExecutedPayload from "./payload/DidExecutedPayload";
import ErrorPayload from "./payload/ErrorPayload";
import WillExecutedPayload from "./payload/WillExecutedPayload";
/**
 * @public
 */
export default class Context {
    private _dispatcher: Dispatcher;
    private _storeGroup: QueuedStoreGroup | StoreGroup | Store;
    private _releaseHandlers: Array<() => void>;

    /**
     * @param {Dispatcher} dispatcher
     * @param {QueuedStoreGroup|StoreGroup|Store} store store is either Store or StoreGroup
     * @public
     */
    constructor({ dispatcher, store }: { dispatcher: Dispatcher; store: QueuedStoreGroup | StoreGroup | Store;}) {
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
    getState<T>(): T {
        return (this._storeGroup as any).getState(); // TODO: remove casting `any`
    }

    /**
     * if anyone store is changed, then call onChangeHandler
     * @param {function(changingStores: Store[])} onChangeHandler
     * @return {Function} release handler function.
     * @public
     */
    onChange(onChangeHandler: (hangingStores: Array<Store>) => void) {
        return (this._storeGroup as any).onChange(onChangeHandler); // TODO: remove casting `any`
    }

    /**
     * @param {UseCase} useCase
     * @returns {UseCaseExecutor}
     * @public
     * @example
     *
     * context.useCase(UseCaseFactory.create()).execute(args);
     */
    useCase(useCase: UseCase): UseCaseExecutor {
        assert.ok(UseCase.isUseCase(useCase), `It should be instance of UseCase: ${useCase}`);
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
    onWillExecuteEachUseCase(handler: (payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        const releaseHandler = this._dispatcher.onDispatch((payload, meta) => {
            if (payload.type === WillExecutedPayload.Type) {
                handler(payload as WillExecutedPayload, meta); // TODO: this should be guarded by type guarde function
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
    onDispatch(handler: (payload: DispatchedPayload, meta: DispatcherPayloadMeta) => void): () => void {
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
    onDidExecuteEachUseCase(handler: (payload: DispatchedPayload, meta: DispatcherPayloadMeta) => void): () => void {
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
    onCompleteEachUseCase(handler: (payload: CompletedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        const releaseHandler = this._dispatcher.onDispatch((payload, meta) => {
            if (payload.type === CompletedPayload.Type) {
                handler(payload as CompletedPayload, meta); // TODO: this should be guarded by type guarde function
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
    onErrorDispatch(handler: (payload: ErrorPayload, meta: DispatcherPayloadMeta) => void): () => void {
        const releaseHandler = this._dispatcher.onDispatch((payload, meta) => {
            if (payload.type === ErrorPayload.Type) {
                handler(payload as ErrorPayload, meta); // TODO: this should be guarded by type guarde function
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
            (this._storeGroup as any).release(); // TODO: remove casting to any
        }
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
    }
}