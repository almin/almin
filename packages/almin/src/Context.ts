///<reference path="UnitOfWork/UseCaseUnitOfWork.ts"/>
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
import { TransactionContext } from "./UnitOfWork/TransactionContext";
import { createSingleStoreGroup } from "./UILayer/SingleStoreGroup";
import { StoreGroupLike } from "./UILayer/StoreGroupLike";

export interface ContextArgs<T> {
    dispatcher: Dispatcher;
    store: StoreLike<T>;
    options?: {
        strict?: boolean;
    };
}

/**
 * Context class provide observing and communicating with **Store** and **UseCase**.
 */
export class Context<T> {
    /**
     * @private
     */
    private _dispatcher: Dispatcher;
    private _storeGroup: StoreGroupLike;
    private _releaseHandlers: Array<() => void>;
    private isStrictMode = false;

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
     *   store: new MyStore()
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
     *   store: storeGroup
     * });
     * ```
     */
    constructor(args: ContextArgs<T>) {
        const store = args.store;
        StoreGroupValidator.validateInstance(store);
        // central dispatcher
        this._dispatcher = args.dispatcher;
        // Implementation Note:
        // Delegate dispatch event to Store|StoreGroup from Dispatcher
        // StoreGroup call each Store#receivePayload, but pass directly Store is not.
        // So, Context check the store instance has implementation of `Store#receivePayload` and pass payload to it.
        // See https://github.com/almin/almin/issues/190
        // createSingleStoreGroup is wrapper of store for creating StoreGroup.
        if (store instanceof StoreGroup) {
            this._storeGroup = store;
        } else if (store instanceof Store) {
            this._storeGroup = createSingleStoreGroup(store);
        } else {
            throw new Error("{ store } should be instanceof StoreGroup or Store.");
        }

        this.isStrictMode = args.options !== undefined && args.options.strict === true;
        if (this.isStrictMode) {
            this._storeGroup.useStrict();
        }
        /**
         * callable release handlers
         * @type {Function[]}
         * @private
         */
        this._releaseHandlers = [];
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
        const unitOfWork = new UseCaseUnitOfWork(this._storeGroup, this._dispatcher, {
            autoCommit: true
        });
        unitOfWork.open(useCaseExecutor);
        useCaseExecutor.onComplete(() => {
            unitOfWork.close(useCaseExecutor);
        });
        return useCaseExecutor;
    }

    /**
     * Create new Transaction(Unit of Work).
     * You can prevent heavy updating of StoreGroup
     *
     * This feature only work in strict mode.
     *
     * Difference with `Context#useCase`:
     *
     * - Do not update StoreGroup automatically
     * - You should call `committer.commit()` to update StoreGroup at any time
     *
     * ```js
     * context.transaction(committer => {
     *      return committer.useCase(new ChangeAUseCase()).execute() // no update store
     *          .then(() => {
     *              return committer.useCase(new ChangeBUseCase()).execute(); // no update store
     *          }).then(() => {
     *              return committer.useCase(new ChangeCUseCase()).execute(); // no update store
     *          }).then(() => {
     *              committer.commit(); // update store
     *              // replay: ChangeAUseCase -> ChangeBUseCase -> ChangeCUseCase
     *          });
     *  })
     * ```
     */
    transaction(committer: (context: TransactionContext) => Promise<any>) {
        if (process.env.NODE_ENV !== "production") {
            if (!this.isStrictMode) {
                console.error(`Warning(Context): Context#transaction only use in strict mode.
Because, the transaction should have reliability of updating stores. strict mode promise it.
Please enable strict mode via \`new Context({ dispatcher, store, options: { strict: true });\`
`);
            }
        }
        const unitOfWork = new UseCaseUnitOfWork(this._storeGroup, this._dispatcher, { autoCommit: false });
        const createUseCaseExecutorAndOpenUoW = <T extends UseCaseLike>(useCase: T): UseCaseExecutor<T> => {
            const useCaseExecutor = createUseCaseExecutor(useCase, this._dispatcher);
            unitOfWork.open(useCaseExecutor);
            return useCaseExecutor;
        };
        const context: TransactionContext = {
            useCase: createUseCaseExecutorAndOpenUoW,
            commit() {
                unitOfWork.commit();
            }
        };
        // committer resolve with void
        // unitOfWork automatically close when committer exit
        // by design.
        return committer(context).then(
            () => {
                unitOfWork.release();
            },
            error => {
                unitOfWork.release();
                return Promise.reject(error);
            }
        );
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
