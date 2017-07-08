// LICENSE : MIT
"use strict";
import { Dispatcher } from "./Dispatcher";
import { DispatchedPayload } from "./Dispatcher";
import { DispatcherPayloadMeta } from "./DispatcherPayloadMeta";
import { Store } from "./Store";
import { StoreLike } from "./StoreLike";
import { UseCaseExecutor } from "./UseCaseExecutor";
import { StoreGroupValidator } from "./UILayer/StoreGroupValidator";
// payloads
import { CompletedPayload, isCompletedPayload } from "./payload/CompletedPayload";
import { isDidExecutedPayload } from "./payload/DidExecutedPayload";
import { ErrorPayload, isErrorPayload } from "./payload/ErrorPayload";
import { WillExecutedPayload, isWillExecutedPayload } from "./payload/WillExecutedPayload";
import { UseCaseFunction } from "./FunctionalUseCaseContext";
import { FunctionalUseCase } from "./FunctionalUseCase";
import { StateMap } from "./UILayer/StoreGroupTypes";
import { UseCaseLike } from "./UseCaseLike";
import { UseCaseUnitOfWork } from "./UnitOfWork/UseCaseUnitOfWork";
import { StoreGroup } from "./UILayer/StoreGroup";
import { createUseCaseExecutor } from "./UseCaseExecutorFactory";

/**
 * Context class provide observing and communicating with **Store** and **UseCase**.
 */
export class Context<T> {
    /**
     * @private
     */
    private _dispatcher: Dispatcher;
    private _storeGroup: StoreLike<T>;
    private _releaseHandlers: Array<() => void>;

    /**
     * `dispatcher` is an instance of `Dispatcher`.
     * `store` is an instance of StoreLike implementation
     *
     * ### Example
     *
     * It is minimal initialization.
     *
     * ```js
     * const context = new Context({
     *   dispatcher: new Dispatcher(),
     *   store: new Store()
     * });
     * ```
     *
     * In real case, you can pass `StoreGroup` instead of `Store`.
     *
     * ```js
     * const storeGroup = new StoreGroup([
     *   new AStore(), new BStore(), new CStore()
     * ]);
     * const context = new Context({
     *   dispatcher: new Dispatcher(),
     *   store: new Store()
     * });
     * ```
     */
    constructor({ dispatcher, store }: { dispatcher: Dispatcher; store: StoreLike<T>; }) {
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
        // StoreGroup call each Store#receivePayload, but pass directly Store is not.
        // So, Context check the store instance has implementation of `Store#receivePayload` and pass payload to it.
        // See https://github.com/almin/almin/issues/190

        if (this._storeGroup instanceof Store) {
            const store = this._storeGroup;
            // Dispatch Flow: Dispatcher -> Store(and receivePayload fallback)
            // Notes: You should not depended on this implementation in production.
            const hasReceivePayload = typeof store.receivePayload === "function";
            const releaseHandler = this._dispatcher.onDispatch((payload: DispatchedPayload, meta: DispatcherPayloadMeta) => {
                store.dispatch(payload, meta);
                if (hasReceivePayload) {
                    // StoreLike has not receivePayload, but Store may has receivePayload
                    (store as Store).receivePayload!(payload);
                }
            });
            this._releaseHandlers.push(releaseHandler);
        } else {
            // Dispatch Flow: Dispatcher -> StoreGroup
            // StoreGroup should have implement that StoreGroup -> Stores
            const releaseHandler = this._dispatcher.pipe(this._storeGroup);
            this._releaseHandlers.push(releaseHandler);
        }
    }

    /**
     * Return state value of StoreGroup or Store.
     *
     * ### Example
     *
     * If you pass `StoreGroup` to `store` of Constructor,
     * `Context#getState()` return the state object that merge each stores's state.
     *
     * ```js
     * const state = context.getState();
     * console.log(state);
     * // { aState, bState }
     * ```
     */
    getState(): StateMap<T> {
        return this._storeGroup.getState();
    }

    /**
     * If anyone store that is passed to constructor is changed, then call `onChange`.
     * `onChange` arguments is an array of `Store` instances.
     *
     * It returns unSubscribe function.
     * If you want to release handler, the returned function.
     *
     * ### Example
     *
     * ```js
     * const unSubscribe = context.onChange(changingStores => {
     *   console.log(changingStores); // Array<Store>
     * });
     * ```
     */
    onChange(handler: (changingStores: Array<Store>) => void): () => void {
        return this._storeGroup.onChange(handler);
    }

    /**
     * `Context#useCase` can accept two type of UseCase.
     *
     * - Instance of UseCase class
     * - **Functional UseCase**
     *
     * ### Example
     *
     * ```js
     * // UseCase class pattern
     * class AwesomeUseCase extends UseCase {
     *    execute(...args){ }
     * }
     *
     * context.useCase(new AwesomeUseCase()).execute([1, 2, 3]);
     * ```
     *
     * OR
     *
     * ```js
     * // Functional UseCase pattern
     * const awesomeUseCase = ({dispatcher}) => {
     *    return (...args) => { }
     * };
     *
     * context.useCase(awesomeUseCase).execute([1, 2, 3]);
     * ```
     */
    useCase(useCase: UseCaseFunction): UseCaseExecutor<FunctionalUseCase>;
    useCase<T extends UseCaseLike>(useCase: T): UseCaseExecutor<T>;
    useCase(useCase: any): UseCaseExecutor<any> {
        const useCaseExecutor = createUseCaseExecutor(useCase, this._dispatcher);
        if (this._storeGroup instanceof StoreGroup) {
            const unitOfWork = new UseCaseUnitOfWork(useCaseExecutor, this._storeGroup, {
                autoCommit: true
            });
            unitOfWork.open();
            useCaseExecutor.onComplete(() => {
                unitOfWork.close();
            });
        }
        return useCaseExecutor;
    }

    /**
     * Register `handler` function to Context.
     * `handler` is called when each useCases will execute.
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
     * Register `handler` function to Context.
     * `handler` is called the `handler` with user-defined payload object when the UseCase dispatch with payload.
     * This `onDispatch` is not called at built-in event. It is filtered by Context.
     * If you want to *All* dispatched event and use listen directly your `dispatcher` object.
     * In other word, listen the dispatcher of `new Context({dispatcher})`.
     *
     * ### Example
     *
     * ```js
     * const dispatchUseCase = ({dispatcher}) => {
     *   return () => dispatcher.dispatch({ type: "fired-payload" });
     * };
     * context.onDispatch((payload, meta) => {
     *   console.log(payload); // { type: "fired-payload" }
     * });
     *
     * context.useCase(dispatchUseCase).execute();
     * ```
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
     * `handler` is called when each useCases are executed.
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
     * `handler` is called when each useCases are completed.
     * This `handler` is always called asynchronously.
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
     * `handler` is called when some UseCase throw Error.
     *
     * Throwing Error is following case:
     *
     * - Throw exception in a UseCase
     * - Return rejected promise in a UseCase
     * - Call `UseCase#throwError(error)`
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
     * Release all events handler in Context.
     * You can call this when no more call event handler
     */
    release() {
        const storeGroup = this._storeGroup;
        if (storeGroup) {
            storeGroup.release();
        }
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
    }
}
