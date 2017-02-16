// LICENSE : MIT
"use strict";
const assert = require("assert");
import Dispatcher from "./Dispatcher";
import UseCase from "./UseCase";
import DispatcherPayloadMeta from "./DispatcherPayloadMeta";

// payloads
import CompletedPayload from "./payload/CompletedPayload";
import DidExecutedPayload from "./payload/DidExecutedPayload";
import WillExecutedPayload from "./payload/WillExecutedPayload";
/**
 * UseCaseExecutor is a helper class for executing UseCase.
 * @public
 */
export default class UseCaseExecutor {
    /**
     * @param {UseCase} useCase
     * @param {UseCase|null} parent parent is parent of `useCase`
     * @param {Dispatcher|UseCase} dispatcher
     * @public
     */
    constructor({
        useCase,
        parent,
        dispatcher
    }) {
        // execute and finish =>
        const useCaseName = useCase.name;
        if (process.env.NODE_ENV !== "production") {
            assert(typeof useCaseName === "string", "UseCase instance should have constructor.name " + useCase);
            assert(typeof useCase.execute === "function", `UseCase instance should have #execute function: ${useCaseName}`);
        }
        /**
         * @type {UseCase} executable useCase
         */
        this.useCase = useCase;

        /**
         * @type {UseCase|null} parent useCase
         */
        this.parentUseCase = parent;
        /**
         * @type {Dispatcher}
         * @private
         */
        this.disptcher = dispatcher;
        /**
         * callable release handlers that are called in release()
         * @type {Function[]}
         * @private
         */
        this._releaseHandlers = [];
        // delegate userCase#onDispatch to central dispatcher
        const unListenHandler = this.useCase.pipe(this.disptcher);
        this._releaseHandlers.push(unListenHandler);
    }

    /**
     * @param {*[]} [args] arguments of the UseCase
     * @private
     */
    _willExecute(args) {
        const payload = new WillExecutedPayload({
            args
        });
        const meta = new DispatcherPayloadMeta({
            useCase: this.useCase,
            dispatcher: this.disptcher,
            parentUseCase: this.parentUseCase,
            isTrusted: true
        });
        this.disptcher.dispatch(payload, meta);
    }

    /**
     * dispatch did execute each UseCase
     * @param {*} [value] result value of the useCase executed
     * @private
     */
    _didExecute(value) {
        const payload = new DidExecutedPayload({
            value
        });
        const meta = new DispatcherPayloadMeta({
            useCase: this.useCase,
            dispatcher: this.disptcher,
            parentUseCase: this.parentUseCase,
            isTrusted: true
        });
        this.disptcher.dispatch(payload, meta);
    }

    /**
     * dispatch complete each UseCase
     * @param {*} [value] unwrapped result value of the useCase executed
     * @private
     */
    _complete(value) {
        const payload = new CompletedPayload({
            value
        });
        const meta = new DispatcherPayloadMeta({
            useCase: this.useCase,
            dispatcher: this.disptcher,
            parentUseCase: this.parentUseCase,
            isTrusted: true
        });
        this.disptcher.dispatch(payload, meta);
    }

    /**
     * called the {@link handler} with useCase when the useCase will do.
     * @param {function(payload: WillExecutedPayload, meta: DispatcherPayloadMeta)} handler
     * @public
     */
    onWillExecuteEachUseCase(handler) {
        const releaseHandler = this.disptcher.onDispatch(function onWillExecute(payload, meta) {
            if (payload.type === WillExecutedPayload.Type) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * called the `handler` with useCase when the useCase is executed.
     * @param {function(payload: DidExecutedPayload, meta: DispatcherPayloadMeta)} handler
     * @public
     */
    onDidExecuteEachUseCase(handler) {
        const releaseHandler = this.disptcher.onDispatch(function onDidExecuted(payload, meta) {
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
     * @returns {Function}
     * @public
     */
    onCompleteExecuteEachUseCase(handler) {
        const releaseHandler = this.disptcher.onDispatch(function onCompleted(payload, meta) {
            if (payload.type === CompletedPayload.Type) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * execute UseCase instance.
     * UseCase is a executable object. it means that has `execute` method.
     * @param args
     * @public
     */
    execute(...args) {
        this._willExecute(args);
        const result = this.useCase.execute(...args);
        // Sync call didExecute
        this._didExecute(result);
        // When UseCase#execute is completed, dispatch "complete".
        return Promise.resolve(result).then((result) => {
            this._complete(result);
            this.release();
        }).catch(error => {
            this.useCase.throwError(error);
            this._complete();
            this.release();
            return Promise.reject(error);
        });
    }

    /**
     * release all events handler.
     * You can call this when no more call event handler
     * @public
     */
    release() {
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
    }
}