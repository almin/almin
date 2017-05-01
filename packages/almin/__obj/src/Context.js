// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { UseCase } from "./UseCase";
import { UseCaseExecutor } from "./UseCaseExecutor";
import { StoreGroupValidator } from "./UILayer/StoreGroupValidator";
// payloads
import { isCompletedPayload } from "./payload/CompletedPayload";
import { isDidExecutedPayload } from "./payload/DidExecutedPayload";
import { isErrorPayload } from "./payload/ErrorPayload";
import { isWillExecutedPayload } from "./payload/WillExecutedPayload";
import { FunctionalUseCase } from "./FunctionalUseCase";
/**
 * Context class provide observing and communicating with **Store** and **UseCase**.
 */
export class Context {
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
    getState() {
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
    onChange(handler) {
        return this._storeGroup.onChange(handler);
    }
    useCase(useCase) {
        // instance of UseCase
        if (UseCase.isUseCase(useCase)) {
            return new UseCaseExecutor({
                useCase,
                parent: null,
                dispatcher: this._dispatcher
            });
        }
        else if (typeof useCase === "function") {
            // When pass UseCase constructor itself, throw assertion error
            assert.ok(Object.getPrototypeOf && Object.getPrototypeOf(useCase) !== UseCase, `Context#useCase argument should be instance of UseCase.
The argument is UseCase constructor itself: ${useCase}`);
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
     * Register `handler` function to Context.
     * `handler` is called when each useCases will execute.
     */
    onWillExecuteEachUseCase(handler) {
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
     * `handler` is called when each useCases are executed.
     */
    onDidExecuteEachUseCase(handler) {
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
    onCompleteEachUseCase(handler) {
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
    onErrorDispatch(handler) {
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