// MIT © 2017 azu
import { DispatchedPayload, Dispatcher } from "./Dispatcher";
import { isWillExecutedPayload, WillExecutedPayload } from "./payload/WillExecutedPayload";
import { DispatcherPayloadMeta } from "./DispatcherPayloadMeta";
import { DidExecutedPayload, isDidExecutedPayload } from "./payload/DidExecutedPayload";
import { CompletedPayload, isCompletedPayload } from "./payload/CompletedPayload";
import { ErrorPayload, isErrorPayload } from "./payload/ErrorPayload";
import { StoreGroupLike } from "./UILayer/StoreGroupLike";
import { Store } from "./Store";
import { EventEmitter } from "events";
import { BeginTransactionPayload, isBeginTransactionPayload } from "./payload/BeginTransactionPayload";
import { EndTransactionPayload, isEndTransactionPayload } from "./payload/EndTransactionPayload";

export interface LifeCycleEventHubArgs {
    dispatcher: Dispatcher;
    storeGroup: StoreGroupLike;
}

/**
 * Wrapper of dispatcher that can observe all almin life-cycle events
 *
 * @see https://almin.js.org/docs/tips/usecase-lifecycle.html
 */
export class LifeCycleEventHub extends EventEmitter {
    private releaseHandlers: (() => void)[];
    private dispatcher: Dispatcher;
    private storeGroup: StoreGroupLike;

    constructor(args: LifeCycleEventHubArgs) {
        super();
        // suppress: memory leak warning of EventEmitter
        this.setMaxListeners(0);
        this.dispatcher = args.dispatcher;
        this.storeGroup = args.storeGroup;
        this.releaseHandlers = [];
    }

    // handlers
    onChange(handler: (stores: Array<Store>) => void) {
        const releaseHandler = this.storeGroup.onChange(handler);
        this.releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    onBeginTransaction(handler: (payload: BeginTransactionPayload, meta: DispatcherPayloadMeta) => void) {
        const releaseHandler = this.dispatcher.onDispatch(function onBeginTransaction(payload, meta) {
            if (isBeginTransactionPayload(payload)) {
                handler(payload, meta);
            }
        });
        this.releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    onEndTransaction(handler: (payload: EndTransactionPayload, meta: DispatcherPayloadMeta) => void) {
        const releaseHandler = this.dispatcher.onDispatch(function onEndTransaction(payload, meta) {
            if (isEndTransactionPayload(payload)) {
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
     * context.onDispatch((payload, meta) => {
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
