// LICENSE : MIT
"use strict";
const assert = require("assert");
import {ActionTypes} from "./Context";
import Dispatcher from "./Dispatcher";
import UseCase from "./UseCase";
export default class UseCaseExecutor {
    /**
     * @param {UseCase} useCase
     * @param {Dispatcher|UseCase} parentDispatcher is parent dispatcher-like object
     */
    constructor(useCase, parentDispatcher) {
        // execute and finish =>
        const useCaseName = useCase.constructor.name;
        assert(typeof useCaseName !== "undefined" && typeof useCaseName === "string", "UseCase instance should have constructor.name " + useCase);
        assert(typeof useCase.execute === "function", `UseCase instance should have #execute function: ${useCaseName}`);
        /**
         * @type {string} useCase name
         */
        this.useCaseName = useCaseName;
        /**
         * @type {UseCase} executable useCase
         */
        this.useCase = useCase;
        /**
         * @type {Dispatcher}
         */
        this.parentDispatcher = parentDispatcher;
        /**
         * callable release handlers that are called in release()
         * @type {Function[]}
         * @private
         */
        this._releaseHandlers = [];
        // delegate userCase#onDispatch to central dispatcher
        const unListenHandler = this.useCase.pipe(this.parentDispatcher);
        this._releaseHandlers.push(unListenHandler);
    }

    /**
     * @param {*[]} [args] arguments of the usecase
     */
    willExecute(args) {
        // emit event for System
        this.parentDispatcher.dispatch({
            type: ActionTypes.ON_WILL_EXECUTE_EACH_USECASE,
            useCase: this.useCase,
            args
        });
    }

    /**
     *
     */
    didExecute() {
        this.parentDispatcher.dispatch({
            type: ActionTypes.ON_DID_EXECUTE_EACH_USECASE,
            useCase: this.useCase
        });
    }

    /**
     * called the {@link handler} with useCase when the useCase will do.
     * @param {function(useCase: UseCase, args: *)} handler
     */
    onWillExecuteEachUseCase(handler) {
        const releaseHandler = this.parentDispatcher.onDispatch(function onWillExecuteEachUseCaseInUseCaseExecutor(payload) {
            if (payload.type === ActionTypes.ON_WILL_EXECUTE_EACH_USECASE) {
                handler(payload.useCase, payload.args);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * called the {@link handler} with useCase when the useCase is done.
     * @param {function(useCase: UseCase)} handler
     */
    onDidExecuteEachUseCase(handler) {
        const releaseHandler = this.parentDispatcher.onDispatch(function onDidExecuteEachUseCaseInUseCaseExecutor(payload){
            if (payload.type === ActionTypes.ON_DID_EXECUTE_EACH_USECASE) {
                handler(payload.useCase);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * execute UseCase instance.
     * UseCase is a executable object. it means that has `execute` method.
     * @param args
     */
    execute(...args) {
        this.willExecute(args);
        const result = this.useCase.execute(...args);
        return Promise.resolve(result).then((result) => {
            this.didExecute(result);
            this.release();
        }).catch(error => {
            this.useCase.throwError(error);
            this.didExecute();
            this.release();
            return Promise.reject(error);
        });
    }

    /**
     * release all events handler.
     * You can call this when no more call event handler
     */
    release() {
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
    }
}