// LICENSE : MIT
"use strict";
const assert = require("assert");
import Dispatcher from "./Dispatcher";
import UseCase from "./UseCase";
export default class UseCaseExecutor {
    /**
     * @param {UseCase} useCase
     * @param {Dispatcher} dispatcher
     */
    constructor(useCase, dispatcher) {
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
        this.dispatcher = dispatcher;
        /**
         * callable release handlers that are called in release()
         * @type {Function[]}
         * @private
         */
        this._releaseHandlers = [];
        // delegate userCase#onDispatch to central dispatcher
        const unListenHandler = this.useCase.pipe(this.dispatcher);
        this._releaseHandlers.push(unListenHandler);
    }

    /**
     * @param {*[]} args arguments of the usecase
     */
    willExecute(args) {
        // emit event for System
        this.dispatcher.dispatchWillExecuteUseCase(this.useCase, args);
    }

    /**
     *
     */
    didExecute(result) {
        // emit event for Store
        this.dispatcher.dispatchDidExecuteUseCase(this.useCase);
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