// LICENSE : MIT
"use strict";
import { DispatchedPayload, Dispatcher } from "./Dispatcher";
import { DispatcherPayloadMeta, DispatcherPayloadMetaImpl } from "./DispatcherPayloadMeta";
import { Store } from "./Store";
import { StoreLike } from "./StoreLike";
import { UseCaseExecutor } from "./UseCaseExecutor";
import { StoreGroupValidator } from "./UILayer/StoreGroupValidator";
// payloads
import { CompletedPayload } from "./payload/CompletedPayload";
import { DidExecutedPayload } from "./payload/DidExecutedPayload";
import { ErrorPayload } from "./payload/ErrorPayload";
import { WillExecutedPayload } from "./payload/WillExecutedPayload";
import { UseCaseFunction } from "./FunctionalUseCaseContext";
import { FunctionalUseCase } from "./FunctionalUseCase";
import { StateMap } from "./UILayer/StoreGroupTypes";
import { UseCaseUnitOfWork } from "./UnitOfWork/UseCaseUnitOfWork";
import { StoreGroup } from "./UILayer/StoreGroup";
import { createUseCaseExecutor } from "./UseCaseExecutorFactory";
import { TransactionContext } from "./UnitOfWork/TransactionContext";
import { createSingleStoreGroup } from "./UILayer/SingleStoreGroup";
import { StoreGroupLike, StoreGroupReasonForChange } from "./UILayer/StoreGroupLike";
import { LifeCycleEventHub } from "./LifeCycleEventHub";
import { StoreChangedPayload } from "./payload/StoreChangedPayload";
import AlminInstruments from "./instrument/AlminInstruments";
import { ContextConfig } from "./ContextConfig";
import { UseCase } from "./UseCase";

const deprecateWarning = (methodName: string) => {
    console.warn(`Deprecated: Context.prototype.${methodName} is deprecated.
Please use Context.prototype.events.${methodName} instead of it.
See https://github.com/almin/almin/releases/tag/almin%400.13.10 for more details.
`);
};

/**
 * Initialize Context with a dispatcher, a Store(Group), and options.
 *
 * ## Example
 *
 * ```js
 * const appContext = new Context({
 *     dispatcher: new Dispatcher(),
 *     store: AppStore.create(),
 *     options: {
 *         strict: true,
 *         performanceProfile: process.env.NODE_ENV !== "production"
 *     }
 * });
 * ```
 */
export interface ContextArgs<T> {
    /**
     * Dispatcher instance.
     *
     * Notes: Almin 0.16+
     *
     * It it optional parameter.
     */
    dispatcher?: Dispatcher;
    /**
     * StoreGroup instance
     */
    store: StoreLike<T>;
    /**
     * Context's option is optional
     */
    options?: {
        /**
         * Set `strict` to `true` to enable strict mode.
         *
         * Strict mode ensure consistency in almin.
         * If you update your store outside of almin, show warning in strict mode.
         *
         * For more details, see <https://almin.js.org/docs/en/strict-mode.html>
         *
         * Default: false(`false` in production build)
         */
        strict?: boolean;
        /**
         * Set `performanceProfile` to `true` to enable profiling performance.
         *
         * If it is `true`, Show UseCase, Store, StoreGroup, and Transaction performance tracing in the browser devtool timeline.
         * Only works in development mode and in browsers that support the [Performance.mark()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/mark).
         *
         * For more details, see <https://almin.js.org/docs/en/performance-profile.html>
         *
         * Default: false(`false` in production build)
         */
        performanceProfile?: boolean;
    };
}

/**
 * Context class provide observing and communicating with **Store** and **UseCase**.
 */
export class Context<T> {
    /**
     * @private
     */
    private dispatcher: Dispatcher;
    private lifeCycleEventHub: LifeCycleEventHub;
    private storeGroup: StoreGroupLike;
    private config: ContextConfig;

    /**
     * Context should be initialized with `store` that is an instance of StoreLike implementation
     *
     * ### Example
     *
     * It is minimal initialization.
     *
     * ```js
     * const context = new Context({
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
     *   store: storeGroup
     * });
     * ```
     */
    constructor(args: ContextArgs<T>) {
        const store = args.store;
        StoreGroupValidator.validateInstance(store);
        // Central dispatcher
        // Almin 0.16+: dispatcher is optional.
        // https://github.com/almin/almin/issues/185
        this.dispatcher = args.dispatcher || new Dispatcher();
        // Implementation Note:
        // Delegate dispatch event to Store|StoreGroup from Dispatcher
        // StoreGroup call each Store#receivePayload, but pass directly Store is not.
        // So, Context check the store instance has implementation of `Store#receivePayload` and pass payload to it.
        // See https://github.com/almin/almin/issues/190
        // createSingleStoreGroup is wrapper of store for creating StoreGroup.
        if (store instanceof StoreGroup) {
            this.storeGroup = store;
        } else if (store instanceof Store) {
            this.storeGroup = createSingleStoreGroup(store);
        } else {
            throw new Error("{ store } should be instanceof StoreGroup or Store.");
        }

        // life-cycle event hub
        this.lifeCycleEventHub = new LifeCycleEventHub({
            dispatcher: this.dispatcher
        });

        const options = args.options || {};
        this.config = new ContextConfig({
            strict: options.strict,
            performanceProfile: options.performanceProfile
        });
        if (this.config.strict) {
            this.storeGroup.useStrict();
        }
        // If some stores are changed, emit StoreChangedPayload
        // Store -> StoreGroup -> LifeCycleEventHub
        const storeGroupOnChangeToStoreChangedPayload = (
            stores: Array<StoreLike<any>>,
            details?: StoreGroupReasonForChange
        ) => {
            stores.forEach(store => {
                const payload = new StoreChangedPayload(store);
                // Should not included in StoreChanged Event
                // inherit some context from the reason of change details
                const transaction = details && details.meta && details.meta.transaction;
                const isUseCaseFinished = details && details.meta && details.meta.isUseCaseFinished;
                const meta = new DispatcherPayloadMetaImpl({
                    // StoreChangedPayload is always trusted.
                    // Because, StoreChangedPayload is created by almin, not user.
                    // Related issue: https://github.com/almin/almin/issues/328
                    isTrusted: true,
                    isUseCaseFinished: isUseCaseFinished,
                    transaction: transaction
                });
                this.dispatcher.dispatch(payload, meta);
            });
        };
        this.storeGroup.onChange(storeGroupOnChangeToStoreChangedPayload);
        // Instruments Transaction/UseCase lifecycle
        if (process.env.NODE_ENV !== "production" && this.config.performanceProfile && AlminInstruments.debugTool) {
            const debugTool = AlminInstruments.debugTool;
            debugTool.beginProfile();
            this.lifeCycleEventHub.onBeginTransaction((_payload, meta) => {
                meta.transaction && debugTool.beginTransaction(meta.transaction.id, meta.transaction);
            });
            this.lifeCycleEventHub.onWillExecuteEachUseCase((_payload, meta) => {
                meta.useCase && debugTool.willUseCaseExecute(meta.useCase.id, meta.useCase);
            });
            this.lifeCycleEventHub.onDidExecuteEachUseCase((_payload, meta) => {
                meta.useCase && debugTool.didUseCaseExecute(meta.useCase.id, meta.useCase);
            });
            this.lifeCycleEventHub.onCompleteEachUseCase((_payload, meta) => {
                meta.useCase && debugTool.completeUseCaseExecute(meta.useCase.id, meta.useCase);
            });
            this.lifeCycleEventHub.onEndTransaction((_payload, meta) => {
                meta.transaction && debugTool.endTransaction(meta.transaction.id, meta.transaction);
            });
        }
    }

    /**
     * Return almin life cycle events hub.
     * You can observe life cycle events on almin.
     *
     * See LifeCycleEventHub
     */
    get events() {
        return this.lifeCycleEventHub;
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
        return this.storeGroup.getState();
    }

    /**
     * If anyone store that is passed to constructor is changed, `handler` is called.
     * `onChange` arguments is an array of `Store` instances that are changed.
     *
     * It returns unSubscribe function.
     * If you want to release handler, the returned function.
     *
     * It is useful for updating view in the `handler`.
     *
     * ### Example
     *
     * ```js
     * const unSubscribe = context.onChange(changingStores => {
     *   console.log(changingStores); // Array<Store>
     *   // Update view
     * });
     * ```
     *
     *
     * ## Notes
     *
     * If you want to know the change of registered store, please use `context.onChange`.
     * `context.onChange` is optimized for updating View.
     * By contrast, `context.events.*` is not optimized data. it is useful for logging.
     *
     */
    onChange(handler: (changingStores: Array<StoreLike<any>>) => void): () => void {
        return this.storeGroup.onChange(handler);
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
    useCase<T extends UseCase>(useCase: T): UseCaseExecutor<T>;
    useCase(useCase: UseCaseFunction): UseCaseExecutor<FunctionalUseCase>;
    useCase(useCase: any): UseCaseExecutor<any> {
        const useCaseExecutor = createUseCaseExecutor(useCase, this.dispatcher);
        const unitOfWork = new UseCaseUnitOfWork({
            name: "Default",
            dispatcher: this.dispatcher,
            storeGroup: this.storeGroup,
            options: { autoCommit: true }
        });
        unitOfWork.open(useCaseExecutor);
        useCaseExecutor.onRelease(() => {
            unitOfWork.close(useCaseExecutor);
            unitOfWork.release();
        });
        return useCaseExecutor;
    }

    /**
     * ## Transaction
     *
     * - **Stability**: Experimental
     * - This feature is subject to change. It may change or be removed in future versions.
     *
     * Create new Unit of Work and execute UseCase.
     * You can prevent heavy updating of StoreGroup.
     *
     * This feature only work in strict mode.
     *
     * Difference with `Context#useCase`:
     *
     * - Do not update StoreGroup automatically
     * - You should call `transactionContext.commit()` to update StoreGroup at any time
     *
     * ## Example
     *
     * ```js
     * context.transaction("A->B->C transaction", transactionContext => {
     *      return transactionContext.useCase(new ChangeAUseCase()).execute() // no update store
     *          .then(() => {
     *              return transactionContext.useCase(new ChangeBUseCase()).execute(); // no update store
     *          }).then(() => {
     *              return transactionContext.useCase(new ChangeCUseCase()).execute(); // no update store
     *          }).then(() => {
     *              transactionContext.commit(); // update store
     *              // replay: ChangeAUseCase -> ChangeBUseCase -> ChangeCUseCase
     *          });
     *  });
     * ```
     *
     * ## Notes
     *
     * ### Transaction should be commit or exit
     *
     * Transaction context should be called `commit()` or `exit()`.
     * Because, this check logic avoid to silent failure of transaction.
     *
     * And, transaction context should return a promise.
     * In most case, transaction context should return `transactionContext.useCase(useCase).execute()`.
     *
     * ### Transaction disallow to do multiple commits
     *
     * A transaction can do a single `commit()`
     * Not to allow to do multiple commits in a transaction.
     *
     * Use multiple transaction chain insteadof multiple commit in a transaction.
     *
     * If you want to multiple commit, please file issue with the motivation.
     *
     * ### Transaction is not lock system
     *
     * The **transaction** does not lock updating of stores.
     * The **transaction** method that create a new unit of work.
     *
     * It means that the store may be updated by other unit of work during executing `context.transaction`.
     * `context.transaction` provide the way for bulk updating.
     *
     * A Unit of Work promise the order of events in the Unit of Work.
     * But, This don't promise the order of events between Unit of Works.
     *
     * ```
     *  -----------------  commit   -----------------
     * | Unit of Work A |  ------> |                 |
     *  ----------------           |    StoreGroup   |
     *  -----------------  commit  |                 |
     * | Unit of Work B |  ------> |                 |
     *  ----------------            -----------------
     * ```
     *
     * Current implementation is **READ COMMITTED** of Transaction Isolation Levels.
     *
     * - <https://en.wikipedia.org/wiki/Isolation_(database_systems)>
     *
     * ### No commit transaction get cancelled
     *
     * You can write no `commit()` transaction.
     * This transaction add commitment to the unit of work, but does not `commit()`.
     *
     * ```js
     * context.transaction("No commit transaction", transactionContext => {
     *      // No commit - Call `transactionContext.exit()` insteadof `transactionContext.commit()`
     *      return transactionContext.useCase(new LogUseCase()).execute().then(() => {
     *          transactionContext.exit();
     *      });
     * });
     * ```
     *
     * As a result, This transaction does not affect to Store.
     * It means that Store can't received the payload of `LogUseCase`.
     * Finally, that commitment get cancelled.
     *
     * It is useful for logging UseCase.
     * Logging UseCase does not need to update store/view.
     * It only does log/send data to console/server.
     *
     * ### TODO: rollback is not implemented
     *
     * Rollback feature is generality implemented in the unit of work.
     * We want to know actual use case of rollback before implementing this.
     *
     */
    transaction(name: string, transactionHandler: (transactionContext: TransactionContext) => Promise<any>) {
        if (process.env.NODE_ENV !== "production") {
            if (!this.config.strict) {
                console.error(`Warning(Context): Context#transaction only use in strict mode.
Because, the transaction should have reliability of updating stores. strict mode promise it.
Please enable strict mode via \`new Context({ dispatcher, store, options: { strict: true });\`
`);
            }
        }
        const unitOfWork = new UseCaseUnitOfWork({
            name,
            dispatcher: this.dispatcher,
            storeGroup: this.storeGroup,
            options: { autoCommit: false }
        });
        const createUseCaseExecutorAndOpenUoW = <T extends UseCase>(useCase: T): UseCaseExecutor<T> => {
            const useCaseExecutor = createUseCaseExecutor(useCase, this.dispatcher);
            unitOfWork.open(useCaseExecutor);
            return useCaseExecutor;
        };
        const context: TransactionContext = {
            id: unitOfWork.id,
            useCase: createUseCaseExecutorAndOpenUoW,
            commit() {
                unitOfWork.commit();
            },
            exit() {
                unitOfWork.exit();
            }
        };
        // Start Transaction
        unitOfWork.beginTransaction();
        // - transactionContext will resolve with void
        // - unitOfWork automatically close when transactionContext is exited
        // It is by design.
        const promise = new Promise((resolve, reject) => {
            const promise = transactionHandler(context);
            const isResultPromise =
                typeof promise === "object" && promise !== null && typeof promise.then == "function";
            // if the transaction failed, exit the transaction and throw error
            if (!isResultPromise) {
                unitOfWork.exit();
                return reject(
                    new Error(`Error(Transaction): transactionHandler should return promise.
Transaction should be exited after all useCases have been completed.

For example, following transaction will be exited after SomeUseCase is completed.

context.transaction("transaction", transactionContext => {
     return transactionContext.useCase(new SomeUseCase()).execute();
});          
`)
                );
            }
            resolve(promise);
        });
        return promise.then(
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
     * @deprecated
     * Use `context.events.onWillExecuteEachUseCase` insteadof it.
     */
    onWillExecuteEachUseCase(handler: (payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        deprecateWarning("onWillExecuteEachUseCase");
        return this.lifeCycleEventHub.onWillExecuteEachUseCase(handler);
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
     *
     * @deprecated
     * Use `context.events.onDispatch` insteadof it.
     */
    onDispatch(handler: (payload: DispatchedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        deprecateWarning("onDispatch");
        return this.lifeCycleEventHub.onDispatch(handler);
    }

    /**
     * `handler` is called when each useCases are executed.
     * @deprecated
     * Use `context.events.onDidExecuteEachUseCase` insteadof it.
     */
    onDidExecuteEachUseCase(handler: (payload: DidExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        deprecateWarning("onDidExecuteEachUseCase");
        return this.lifeCycleEventHub.onDidExecuteEachUseCase(handler);
    }

    /**
     * `handler` is called when each useCases are completed.
     * This `handler` is always called asynchronously.
     * @deprecated
     * Use `context.events.onCompleteEachUseCase` insteadof it.
     */
    onCompleteEachUseCase(handler: (payload: CompletedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        deprecateWarning("onCompleteEachUseCase");
        return this.lifeCycleEventHub.onCompleteEachUseCase(handler);
    }

    /**
     * `handler` is called when some UseCase throw Error.
     *
     * Throwing Error is following case:
     *
     * - Throw exception in a UseCase
     * - Return rejected promise in a UseCase
     * - Call `UseCase#throwError(error)`
     * @deprecated
     * Use `context.events.onErrorDispatch` insteadof it.
     */
    onErrorDispatch(handler: (payload: ErrorPayload, meta: DispatcherPayloadMeta) => void): () => void {
        deprecateWarning("onErrorDispatch");
        return this.lifeCycleEventHub.onErrorDispatch(handler);
    }

    /**
     * Release all events handler in Context.
     * You can call this when no more call event handler
     */
    release() {
        this.storeGroup.release();
        this.lifeCycleEventHub.release();
    }
}
