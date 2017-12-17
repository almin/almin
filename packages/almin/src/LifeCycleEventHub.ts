// MIT © 2017 azu
import { DispatchedPayload, Dispatcher } from "./Dispatcher";
import { isWillExecutedPayload, WillExecutedPayload } from "./payload/WillExecutedPayload";
import { DispatcherPayloadMeta } from "./DispatcherPayloadMeta";
import { DidExecutedPayload, isDidExecutedPayload } from "./payload/DidExecutedPayload";
import { CompletedPayload, isCompletedPayload } from "./payload/CompletedPayload";
import { ErrorPayload, isErrorPayload } from "./payload/ErrorPayload";
import { isTransactionBeganPayload, TransactionBeganPayload } from "./payload/TransactionBeganPayload";
import { isTransactionEndedPayload, TransactionEndedPayload } from "./payload/TransactionEndedPayload";
import { isStoreChangedPayload, StoreChangedPayload } from "./payload/StoreChangedPayload";
import { isWillNotExecutedPayload, WillNotExecutedPayload } from "./payload/WillNotExecutedPayload";

export interface LifeCycleEventHubArgs {
    dispatcher: Dispatcher;
}

/**
 * LifeCycleEventHub provide the way for observing almin life-cycle events.
 *
 * ## See also
 *
 * - <https://almin.js.org/docs/en/usecase-lifecycle.html>
 * - [almin-logger](https://github.com/almin/almin/tree/master/packages/almin-logger)
 */
export class LifeCycleEventHub {
    /**
     * @private
     */
    private releaseHandlers: (() => void)[];
    private dispatcher: Dispatcher;

    constructor(args: LifeCycleEventHubArgs) {
        this.dispatcher = args.dispatcher;
        this.releaseHandlers = [];
    }

    /**
     * Register `handler` function that is called when a Store is changed.
     *
     * ## Notes
     *
     * This event should not use for updating view.
     *
     * ```js
     * // BAD
     * context.events.onChangeStore((store) => {
     *    updateView();
     * })
     * ```
     *
     * You should use `context.onChange` for updating view.
     *
     * ```
     * // GOOD
     * context.onChange(() => {
     *    updateView();
     * })
     * ```
     *
     * Because, `context.onChange` is optimized for updating view.
     * By contrast, `context.events.onChangeStore` is not optimized data.
     * It is useful data for logging.
     */
    onChangeStore(handler: (payload: StoreChangedPayload, meta: DispatcherPayloadMeta) => void) {
        const releaseHandler = this.dispatcher.onDispatch(function onChangeStore(payload, meta) {
            if (isStoreChangedPayload(payload)) {
                handler(payload, meta);
            }
        });
        this.releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * Register `handler` function that is called when begin `Context.transaction`.
     *
     * This `handler` will be not called when `Context.useCase` is executed.
     */
    onBeginTransaction(handler: (payload: TransactionBeganPayload, meta: DispatcherPayloadMeta) => void) {
        const releaseHandler = this.dispatcher.onDispatch(function onBeginTransaction(payload, meta) {
            if (isTransactionBeganPayload(payload)) {
                handler(payload, meta);
            }
        });
        this.releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * Register `handler` function that is called when `Context.transaction` is ended.
     *
     * This `handler` will be not called when `Context.useCase` is executed.
     */
    onEndTransaction(handler: (payload: TransactionEndedPayload, meta: DispatcherPayloadMeta) => void) {
        const releaseHandler = this.dispatcher.onDispatch(function onEndTransaction(payload, meta) {
            if (isTransactionEndedPayload(payload)) {
                handler(payload, meta);
            }
        });
        this.releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * Register `handler` function to Context.
     * `handler` is called when each useCases will not execute.
     * In other words, `UseCase#shouldExecute` return false.
     */
    onWillNotExecuteEachUseCase(
        handler: (payload: WillNotExecutedPayload, meta: DispatcherPayloadMeta) => void
    ): () => void {
        const releaseHandler = this.dispatcher.onDispatch(function onWillNotExecuteEachUseCase(payload, meta) {
            if (isWillNotExecutedPayload(payload)) {
                handler(payload, meta);
            }
        });
        this.releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * Register `handler` function to Context.
     * `handler` is called when each useCases will execute.
     */
    onWillExecuteEachUseCase(handler: (payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        const releaseHandler = this.dispatcher.onDispatch(function onWillExecuteEachUseCase(payload, meta) {
            if (isWillExecutedPayload(payload)) {
                handler(payload, meta);
            }
        });
        this.releaseHandlers.push(releaseHandler);
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
     * context.events.onDispatch((payload, meta) => {
     *   console.log(payload); // { type: "fired-payload" }
     * });
     *
     * context.useCase(dispatchUseCase).execute();
     * ```
     */
    onDispatch(handler: (payload: DispatchedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        const releaseHandler = this.dispatcher.onDispatch(function onDispatch(payload, meta) {
            // call handler, if payload's type is not built-in event.
            // It means that `onDispatch` is called when dispatching user event.
            if (!meta.isTrusted) {
                handler(payload, meta);
            }
        });
        this.releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * `handler` is called when each useCases are executed.
     */
    onDidExecuteEachUseCase(handler: (payload: DidExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        const releaseHandler = this.dispatcher.onDispatch(function onDidExecuteEachUseCase(payload, meta) {
            if (isDidExecutedPayload(payload)) {
                handler(payload, meta);
            }
        });
        this.releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * `handler` is called when each useCases are completed.
     * This `handler` is always called asynchronously.
     */
    onCompleteEachUseCase(handler: (payload: CompletedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        const releaseHandler = this.dispatcher.onDispatch(function onCompleteEachUseCase(payload, meta) {
            if (isCompletedPayload(payload)) {
                handler(payload, meta);
            }
        });
        this.releaseHandlers.push(releaseHandler);
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
        const releaseHandler = this.dispatcher.onDispatch(function onErrorDispatch(payload, meta) {
            if (isErrorPayload(payload)) {
                handler(payload, meta);
            }
        });
        this.releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * Release all events handler.
     */
    release() {
        this.releaseHandlers.forEach(releaseHandler => releaseHandler());
        this.releaseHandlers.length = 0;
    }
}
