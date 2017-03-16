// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { StoreGroup } from "./UILayer/StoreGroup";
import { QueuedStoreGroup } from "./UILayer/QueuedStoreGroup";
import { Dispatcher } from "./Dispatcher";
import { DispatchedPayload } from "./Dispatcher";
import { DispatcherPayloadMeta } from "./DispatcherPayloadMeta";
import { UseCase } from "./UseCase";
import { Store } from "./Store";
import { StoreLike } from "./StoreLike";
import { UseCaseExecutor } from "./UseCaseExecutor";
import { StoreGroupValidator } from "./UILayer/StoreGroupValidator";
// payloads
import { CompletedPayload, isCompletedPayload } from "./payload/CompletedPayload";
import { isDidExecutedPayload } from "./payload/DidExecutedPayload";
import { ErrorPayload, isErrorPayload } from "./payload/ErrorPayload";
import { WillExecutedPayload, isWillExecutedPayload } from "./payload/WillExecutedPayload";
import { FunctionalUseCaseContext } from "./FunctionalUseCaseContext";
import { FunctionalUseCase } from "./FunctionalUseCase";

/**
 * @public
 */
export class Context {
    private _dispatcher: Dispatcher;
    private _storeGroup: StoreLike & Dispatcher;
    private _releaseHandlers: Array<() => void>;

    /**
     * @param {Dispatcher} dispatcher
     * @param {QueuedStoreGroup|StoreGroup|Store} store store is either Store or StoreGroup
     * @public
     */
    constructor({dispatcher, store}: {dispatcher: Dispatcher; store: QueuedStoreGroup | StoreGroup | Store;}) {
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
        return this._storeGroup.getState<T>();
    }

    /**
     * if anyone store is changed, then call onChangeHandler
     * @param {function(changingStores: Store[])} onChangeHandler
     * @return {Function} release handler function.
     * @public
     */
    onChange(onChangeHandler: (hangingStores: Array<Store>) => void) {
        return this._storeGroup.onChange(onChangeHandler);
    }

    useCase(useCase: (context: FunctionalUseCaseContext) => Function): UseCaseExecutor;
    /**
     * create wrapper of UseCase class
     * @param {UseCase} useCase
     * @returns {UseCaseExecutor}
     * @public
     * @example
     *
     * context.useCase(UseCaseFactory.create()).execute(args);
     */
    useCase(useCase: UseCase): UseCaseExecutor;
    useCase(useCase: any): UseCaseExecutor {
        // instance of UseCase
        if (UseCase.isUseCase(useCase)) {
            return new UseCaseExecutor({
                useCase,
                parent: null,
                dispatcher: this._dispatcher
            });
        } else if (typeof useCase === "function") {
            // When pass UseCase constructor itself, throw assertion error
            assert.ok(Object.getPrototypeOf && Object.getPrototypeOf(useCase) !== UseCase,
                `Context#useCase argument should be instance of UseCase.
The argument is UseCase constructor itself: ${useCase}`
            );
            // function to be FunctionalUseCase
            const functionalUseCase = new FunctionalUseCase(useCase, this._dispatcher);
            return new UseCaseExecutor({
                useCase: functionalUseCase,
                parent: null,
                dispatcher: this._dispatcher
            });
        }
        throw new Error(`Context#useCase argument should be UseCase: ${useCase}`);
    }

    /**
     * called the {@link handler} with useCase when the useCase will do.
     * @param {function(payload: WillExecutedPayload, meta: DispatcherPayloadMetaImpl)} handler
     * @public
     */
    onWillExecuteEachUseCase(handler: (payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        const releaseHandler = this._dispatcher.onDispatch((payload, meta) => {
            if (isWillExecutedPayload(payload)) {
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
     * @param {function(payload: DispatchedPayload, meta: DispatcherPayloadMetaImpl)} handler
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
     * @param {function(payload: DidExecutedPayload, meta: DispatcherPayloadMetaImpl)} handler
     * @public
     */
    onDidExecuteEachUseCase(handler: (payload: DispatchedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        const releaseHandler = this._dispatcher.onDispatch((payload, meta) => {
            if (isDidExecutedPayload(payload)) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * called the `handler` with useCase when the useCase is completed.
     * @param {function(payload: CompletedPayload, meta: DispatcherPayloadMetaImpl)} handler
     * @public
     */
    onCompleteEachUseCase(handler: (payload: CompletedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        const releaseHandler = this._dispatcher.onDispatch((payload, meta) => {
            if (isCompletedPayload(payload)) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }


    /**
     * called the `errorHandler` with error when error is occurred.
     * @param {function(payload: ErrorPayload, meta: DispatcherPayloadMetaImpl)} handler
     * @returns {function(this:Dispatcher)}
     * @public
     */
    onErrorDispatch(handler: (payload: ErrorPayload, meta: DispatcherPayloadMeta) => void): () => void {
        const releaseHandler = this._dispatcher.onDispatch((payload, meta) => {
            if (isErrorPayload(payload)) {
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
        const storeGroup = this._storeGroup;
        if (!!storeGroup && typeof storeGroup.release === "function") {
            storeGroup.release();
        }
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
    }
}
