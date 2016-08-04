// LICENSE : MIT
"use strict";
const assert = require("assert");
const isPromise = require('is-promise');
import {ActionTypes} from "./Context";
import Dispatcher from "./Dispatcher";
import UseCase from "./UseCase";
export default class UseCaseExecutor {
    /**
     * @param {UseCase} useCase
     * @param {UseCase|null} parent parent is parent of `useCase`
     * @param {Dispatcher|UseCase} dispatcher
     */
    constructor({
        useCase,
        parent,
        dispatcher
    }) {
        // execute and finish =>
        const useCaseName = useCase.name;
        assert(typeof useCaseName === "string", "UseCase instance should have constructor.name " + useCase);
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
         * @type {UseCase|null} parent useCase
         */
        this.parentUseCase = parent;
        /**
         * @type {Dispatcher}
         * @private
         */
        this.disptcher = dispatcher;

        /**
         * is the useCase executed
         * @type {boolean}
         * @private
         */
        this._isExecuted = false;

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
     * @param {*[]} [args] arguments of the usecase
     */
    willExecute(args) {
        // emit event for System
        this.disptcher.dispatch({
            type: ActionTypes.ON_WILL_EXECUTE_EACH_USECASE,
            useCase: this.useCase,
            parent: this.parentUseCase,
            args
        });
    }

    /**
     * dispatch did execute each UseCase at once
     */
    didExecute() {
        if (this._isExecuted) {
            return;
        }
        this.disptcher.dispatch({
            type: ActionTypes.ON_DID_EXECUTE_EACH_USECASE,
            useCase: this.useCase,
            parent: this.parentUseCase
        });
        this._isExecuted = true;
    }

    /**
     * called the {@link handler} with useCase when the useCase will do.
     * @param {function(useCase: UseCase, args: *)} handler
     */
    onWillExecuteEachUseCase(handler) {
        const releaseHandler = this.disptcher.onDispatch(function onWillExecuteEachUseCaseInUseCaseExecutor(payload) {
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
        const releaseHandler = this.disptcher.onDispatch(function onDidExecuteEachUseCaseInUseCaseExecutor(payload) {
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
        // Sync call didExecute
        if (!isPromise(result)) {
            this.didExecute(result);
        }
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