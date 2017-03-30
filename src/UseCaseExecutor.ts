// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { Dispatcher } from "./Dispatcher";
import { UseCase } from "./UseCase";
import { DispatcherPayloadMeta, DispatcherPayloadMetaImpl } from "./DispatcherPayloadMeta";
import { UseCaseInstanceMap } from "./UseCaseInstanceMap";
// payloads
import { CompletedPayload, isCompletedPayload } from "./payload/CompletedPayload";
import { DidExecutedPayload, isDidExecutedPayload } from "./payload/DidExecutedPayload";
import { WillExecutedPayload, isWillExecutedPayload } from "./payload/WillExecutedPayload";
import { UseCaseLike } from "./UseCaseLike";
import { Payload } from "./payload/Payload";

/**
 * When child is completed after parent did completed, display warning warning message
 * @private
 */
const warningUseCaseIsAlreadyReleased = (parentUseCase: UseCaseLike, useCase: UseCaseLike, payload: Payload, meta: DispatcherPayloadMeta) => {
    console.warn(`${useCase.name}'s parent UseCase(${parentUseCase.name}) is already released.
This UseCase(${useCase.name}) will not work correctly.
https://almin.js.org/docs/warnings/usecase-is-already-released.html
`, payload, meta);
};

export interface UseCaseExecutorArgs {
    useCase: UseCaseLike;
    parent: UseCase | null;
    dispatcher: Dispatcher;
}

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
     * A executable useCase
     */
    private _useCase: UseCaseLike;

    /**
     * A parent useCase
     */
    private _parentUseCase: UseCase | null;

    /**
     * A dispatcher instance
     */
    private _dispatcher: Dispatcher;

    /**
     * callable release handlers that are called in release()
     */
    private _releaseHandlers: Array<() => void>;

    /**
     * @param   useCase
     * @param   parent
     *      parent is parent of `useCase`
     * @param   dispatcher
     * @public
     *
     * **internal** documentation
     */
    constructor({
        useCase,
        parent,
        dispatcher
    }: UseCaseExecutorArgs) {
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
    private _willExecute(args?: any[]): void {
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
            isTrusted: true
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
     * @param   [value] result value of the useCase executed
     */
    private _didExecute(value?: any): void {
        const payload = new DidExecutedPayload({
            value
        });
        const meta = new DispatcherPayloadMetaImpl({
            useCase: this._useCase,
            dispatcher: this._dispatcher,
            parentUseCase: this._parentUseCase,
            isTrusted: true
        });
        this._dispatcher.dispatch(payload, meta);
    }

    /**
     * dispatch complete each UseCase
     * @param   [value] unwrapped result value of the useCase executed
     */
    private _complete(value?: any): void {
        const payload = new CompletedPayload({
            value
        });
        const meta = new DispatcherPayloadMetaImpl({
            useCase: this._useCase,
            dispatcher: this._dispatcher,
            parentUseCase: this._parentUseCase,
            isTrusted: true
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
    onWillExecuteEachUseCase(handler: (payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void {
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
    onDidExecuteEachUseCase(handler: (payload: DidExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void {
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
    onCompleteExecuteEachUseCase(handler: (payload: CompletedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        const releaseHandler = this._dispatcher.onDispatch(function onCompleted(payload, meta) {
            if (isCompletedPayload(payload)) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * execute UseCase instance.
     * UseCase is a executable object. it means that has `execute` method.
     * Notes: UseCaseExecutor doesn't return resolved value by design
     * @param args
     */
    execute(): Promise<void>;
    execute<T>(args: T): Promise<void>;
    execute(...args: Array<any>): Promise<void> {
        this._willExecute(args);
        const result = this._useCase.execute(...args);
        // Sync call didExecute
        this._didExecute(result);
        // When UseCase#execute is completed, dispatch "complete".
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
    release(): void {
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
    }
}
