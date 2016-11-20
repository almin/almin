// LICENSE : MIT
"use strict";
const assert = require("assert");
import {ActionTypes} from "./Context";
import Dispatcher from "./Dispatcher";
import UseCase from "./UseCase";
import DispatcherPayloadMeta from "./DispatcherPayloadMeta";
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
         * @type {string} useCase name
         */
        this.useCaseName = useCaseName;
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
    willExecute(args) {
        // emit event for System
        const meta = new DispatcherPayloadMeta({
            useCase: this.useCase,
            parentDispatcher: this.parentUseCase,
            args
        });
        this.disptcher.dispatch({
            type: ActionTypes.ON_WILL_EXECUTE_EACH_USECASE,
            args
        }, meta);
    }

    /**
     * dispatch did execute each UseCase
     * @private
     */
    didExecute() {
        const meta = new DispatcherPayloadMeta({
            useCase: this.useCase,
            parentDispatcher: this.parentUseCase
        });
        this.disptcher.dispatch({
            type: ActionTypes.ON_DID_EXECUTE_EACH_USECASE
        }, meta);
    }

    /**
     * dispatch complete each UseCase
     * @private
     */
    complete() {
        const meta = new DispatcherPayloadMeta({
            useCase: this.useCase,
            parentDispatcher: this.parentUseCase
        });
        this.disptcher.dispatch({
            type: ActionTypes.ON_COMPLETE_EACH_USECASE
        }, meta);
    }

    /**
     * called the {@link handler} with useCase when the useCase will do.
     * @param {function(useCase: UseCase, args: *)} handler
     * @public
     */
    onWillExecuteEachUseCase(handler) {
        const releaseHandler = this.disptcher.onDispatch(function onWillExecute(payload) {
            if (payload.type === ActionTypes.ON_WILL_EXECUTE_EACH_USECASE) {
                handler(payload.useCase, payload.args);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * called the `handler` with useCase when the useCase is executed.
     * @param {function(payload: DispatcherPayload, meta: DispatcherPayloadMeta)} handler
     * @public
     */
    onDidExecuteEachUseCase(handler) {
        const releaseHandler = this.disptcher.onDispatch(function onDidExecuted(payload, meta) {
            if (payload.type === ActionTypes.ON_DID_EXECUTE_EACH_USECASE) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * called the `handler` with useCase when the useCase is completed.
     * @param {function(payload: DispatcherPayload, meta: DispatcherPayloadMeta)} handler
     * @returns {Function}
     * @public
     */
    onCompleteExecuteEachUseCase(handler) {
        const releaseHandler = this.disptcher.onDispatch(function onCompleted(payload, meta) {
            if (payload.type === ActionTypes.ON_COMPLETE_EACH_USECASE) {
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
        this.willExecute(args);
        const result = this.useCase.execute(...args);
        // Sync call didExecute
        this.didExecute(result);
        // When UseCase#execute is completed, dispatch "complete".
        return Promise.resolve(result).then((result) => {
            this.complete(result);
            this.release();
        }).catch(error => {
            this.useCase.throwError(error);
            this.complete();
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