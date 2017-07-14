// LICENSE : MIT
"use strict";
import { DispatchedPayload, Dispatcher } from "./Dispatcher";
import { DispatcherPayloadMeta } from "./DispatcherPayloadMeta";
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
import { UseCaseLike } from "./UseCaseLike";
import { UseCaseUnitOfWork } from "./UnitOfWork/UseCaseUnitOfWork";
import { StoreGroup } from "./UILayer/StoreGroup";
import { createUseCaseExecutor } from "./UseCaseExecutorFactory";
import { TransactionContext } from "./UnitOfWork/TransactionContext";
import { createSingleStoreGroup } from "./UILayer/SingleStoreGroup";
import { StoreGroupLike } from "./UILayer/StoreGroupLike";
import { LifeCycleEventHub } from "./LifeCycleEventHub";
import { TransactionUseCaseUnitOfWork } from "./UnitOfWork/TransactionUseCaseUnitOfWork";
import { TransactionBeganPayload } from "./payload/TransactionBeganPayload";
import { TransactionEndedPayload } from "./payload/TransactionEndedPayload";

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
    private dispatcher: Dispatcher;
    private lifeCycleEventHub: LifeCycleEventHub;
    private storeGroup: StoreGroupLike;
    private isStrictMode = false;
    private defaultUnitOfWork: UseCaseUnitOfWork;

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
        this.dispatcher = args.dispatcher;
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
            dispatcher: this.dispatcher,
            storeGroup: this.storeGroup
        });

        this.isStrictMode = args.options !== undefined && args.options.strict === true;
        if (this.isStrictMode) {
            this.storeGroup.useStrict();
        }
        this.defaultUnitOfWork = new UseCaseUnitOfWork({
            name: "Default",
            dispatcher: this.dispatcher,
            storeGroup: this.storeGroup,
            options: { autoCommit: true }
        });
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
        return this.lifeCycleEventHub.onChange(handler);
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
        const useCaseExecutor = createUseCaseExecutor(useCase, this.dispatcher);
        this.defaultUnitOfWork.open(useCaseExecutor);
        useCaseExecutor.onComplete(() => {
            this.defaultUnitOfWork.close(useCaseExecutor);
        });
        return useCaseExecutor;
    }

    /**
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
     * ### Transaction is not lock system
     *
     * The **transaction** does not lock the store.
     * The **transaction** is a unit of work.
     *
     * It means that the store may be updated by other unit of work during executing `context.transaction`.
     * `context.transaction` provide the way for bulk updating.
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
     *      // No commit
     *      return transactionContext.useCase(new LogUseCase()).execute();
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
            if (!this.isStrictMode) {
                console.error(`Warning(Context): Context#transaction only use in strict mode.
Because, the transaction should have reliability of updating stores. strict mode promise it.
Please enable strict mode via \`new Context({ dispatcher, store, options: { strict: true });\`
`);
            }
        }
        const unitOfWork = new TransactionUseCaseUnitOfWork({
            name,
            dispatcher: this.dispatcher,
            storeGroup: this.storeGroup,
            options: { autoCommit: false }
        });
        const createUseCaseExecutorAndOpenUoW = <T extends UseCaseLike>(useCase: T): UseCaseExecutor<T> => {
            const useCaseExecutor = createUseCaseExecutor(useCase, this.dispatcher);
            unitOfWork.open(useCaseExecutor);
            return useCaseExecutor;
        };
        const context: TransactionContext = {
            useCase: createUseCaseExecutorAndOpenUoW,
            commit() {
                unitOfWork.commit();
            }
        };
        unitOfWork.beginTransaction();
        // transactionContext resolve with void
        // unitOfWork automatically close on transactionContext exited
        // by design.
        return transactionHandler(context).then(
            () => {
                unitOfWork.endTransaction();
                unitOfWork.release();
            },
            error => {
                unitOfWork.endTransaction();
                unitOfWork.release();
                return Promise.reject(error);
            }
        );
    }

    /**
     * Register `handler` function that is called when begin `Context.transaction`.
     */
    onBeginTransaction(handler: (payload: TransactionBeganPayload, meta: DispatcherPayloadMeta) => void) {
        return this.lifeCycleEventHub.onBeginTransaction(handler);
    }

    /**
     * Register `handler` function that is called when `Context.transaction` is ended.
     */
    onEndTransaction(handler: (payload: TransactionEndedPayload, meta: DispatcherPayloadMeta) => void) {
        return this.lifeCycleEventHub.onEndTransaction(handler);
    }

    /**
     * Register `handler` function to Context.
     * `handler` is called when each useCases will execute.
     */
    onWillExecuteEachUseCase(handler: (payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void {
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
     */
    onDispatch(handler: (payload: DispatchedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        return this.lifeCycleEventHub.onDispatch(handler);
    }

    /**
     * `handler` is called when each useCases are executed.
     */
    onDidExecuteEachUseCase(handler: (payload: DidExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        return this.lifeCycleEventHub.onDidExecuteEachUseCase(handler);
    }

    /**
     * `handler` is called when each useCases are completed.
     * This `handler` is always called asynchronously.
     */
    onCompleteEachUseCase(handler: (payload: CompletedPayload, meta: DispatcherPayloadMeta) => void): () => void {
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
     */
    onErrorDispatch(handler: (payload: ErrorPayload, meta: DispatcherPayloadMeta) => void): () => void {
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
