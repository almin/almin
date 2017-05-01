// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { DispatcherPayloadMetaImpl } from "./DispatcherPayloadMeta";
import { UseCaseInstanceMap } from "./UseCaseInstanceMap";
// payloads
import { CompletedPayload, isCompletedPayload } from "./payload/CompletedPayload";
import { DidExecutedPayload, isDidExecutedPayload } from "./payload/DidExecutedPayload";
import { WillExecutedPayload, isWillExecutedPayload } from "./payload/WillExecutedPayload";
/**
 * When child is completed after parent did completed, display warning warning message
 * @private
 */
const warningUseCaseIsAlreadyReleased = (parentUseCase, useCase, payload, meta) => {
    console.warn(`${useCase.name}'s parent UseCase(${parentUseCase.name}) is already released.
This UseCase(${useCase.name}) will not work correctly.
https://almin.js.org/docs/warnings/usecase-is-already-released.html
`, payload, meta);
};
/**
 * `UseCaseExecutor` is a helper class for executing UseCase.
 *
 * You can not create the instance of UseCaseExecutor directory.
 * You can get the instance by `Context#useCase(useCase)`,
 *
 * @private
 */
export class UseCaseExecutor {
    /**
     * @param   useCase
     * @param   parent
     *      parent is parent of `useCase`
     * @param   dispatcher
     * @public
     *
     * **internal** documentation
     */
    constructor({ useCase, parent, dispatcher }) {
        if (process.env.NODE_ENV !== "production") {
            // execute and finish =>
            const useCaseName = useCase.name;
            assert.ok(typeof useCaseName === "string", `UseCase instance should have constructor.name ${useCase}`);
            assert.ok(typeof useCase.execute === "function", `UseCase instance should have #execute function: ${useCaseName}`);
        }
        this._useCase = useCase;
        this._parentUseCase = parent;
        this._dispatcher = dispatcher;
        this._releaseHandlers = [];
        // delegate userCase#onDispatch to central dispatcher
        const unListenHandler = this._useCase.pipe(this._dispatcher);
        this._releaseHandlers.push(unListenHandler);
    }
    /**
     * @param   [args] arguments of the UseCase
     */
    _willExecute(args) {
        // Add instance to manager
        // It should be removed when it will be completed.
        UseCaseInstanceMap.set(this._useCase, this);
        const payload = new WillExecutedPayload({
            args
        });
        const meta = new DispatcherPayloadMetaImpl({
            useCase: this._useCase,
            dispatcher: this._dispatcher,
            parentUseCase: this._parentUseCase,
            isTrusted: true,
            isUseCaseFinished: false
        });
        this._dispatcher.dispatch(payload, meta);
        // Warning: parentUseCase is already released
        if (process.env.NODE_ENV !== "production") {
            if (this._parentUseCase && !UseCaseInstanceMap.has(this._parentUseCase)) {
                warningUseCaseIsAlreadyReleased(this._parentUseCase, this._useCase, payload, meta);
            }
        }
    }
    /**
     * dispatch did execute each UseCase
     */
    _didExecute(isFinished, value) {
        const payload = new DidExecutedPayload({
            value
        });
        const meta = new DispatcherPayloadMetaImpl({
            useCase: this._useCase,
            dispatcher: this._dispatcher,
            parentUseCase: this._parentUseCase,
            isTrusted: true,
            isUseCaseFinished: isFinished
        });
        this._dispatcher.dispatch(payload, meta);
    }
    /**
     * dispatch complete each UseCase
     * @param   [value] unwrapped result value of the useCase executed
     */
    _complete(value) {
        const payload = new CompletedPayload({
            value
        });
        const meta = new DispatcherPayloadMetaImpl({
            useCase: this._useCase,
            dispatcher: this._dispatcher,
            parentUseCase: this._parentUseCase,
            isTrusted: true,
            isUseCaseFinished: true
        });
        this._dispatcher.dispatch(payload, meta);
        // Warning: parentUseCase is already released
        if (process.env.NODE_ENV !== "production") {
            if (this._parentUseCase && !UseCaseInstanceMap.has(this._parentUseCase)) {
                warningUseCaseIsAlreadyReleased(this._parentUseCase, this._useCase, payload, meta);
            }
        }
        // Delete the reference from instance manager
        // It prevent leaking of instance.
        UseCaseInstanceMap.delete(this._useCase);
    }
    /**
     * called the {@link handler} with useCase when the useCase will do.
     * @param   handler
     */
    onWillExecuteEachUseCase(handler) {
        const releaseHandler = this._dispatcher.onDispatch(function onWillExecute(payload, meta) {
            if (isWillExecutedPayload(payload)) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }
    /**
     * called the `handler` with useCase when the useCase is executed.
     * @param   handler
     */
    onDidExecuteEachUseCase(handler) {
        const releaseHandler = this._dispatcher.onDispatch(function onDidExecuted(payload, meta) {
            if (isDidExecutedPayload(payload)) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }
    /**
     * called the `handler` with useCase when the useCase is completed.
     * @param   handler
     * @returns
     */
    onCompleteExecuteEachUseCase(handler) {
        const releaseHandler = this._dispatcher.onDispatch(function onCompleted(payload, meta) {
            if (isCompletedPayload(payload)) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }
    execute(...args) {
        this._willExecute(args);
        const result = this._useCase.execute(...args);
        const isResultPromise = result && typeof result.then == "function";
        // if the UseCase return a promise, almin recognize the UseCase as continuous.
        // In other word, If the UseCase want to continue, please return a promise object.
        const isUseCaseFinished = !isResultPromise;
        // Sync call didExecute
        this._didExecute(isUseCaseFinished, result);
        // Async call complete
        return Promise.resolve(result).then((result) => {
            this._complete(result);
            this.release();
        }).catch(error => {
            this._useCase.throwError(error);
            this._complete();
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
