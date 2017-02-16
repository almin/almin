// LICENSE : MIT
"use strict";
import * as assert from "assert";
import Dispatcher from "./Dispatcher";
import UseCase from "./UseCase";
import DispatcherPayloadMeta from "./DispatcherPayloadMeta";

// payloads
import CompletedPayload from "./payload/CompletedPayload";
import DidExecutedPayload from "./payload/DidExecutedPayload";
import WillExecutedPayload from "./payload/WillExecutedPayload";

export interface UseCaseExecutorArgs {
    useCase: UseCase;
    parent: UseCase | null;
    dispatcher: Dispatcher | UseCase;
}

/**
 * UseCaseExecutor is a helper class for executing UseCase.
 */
export default class UseCaseExecutor {

    /**
     *  executable useCase
     */
    useCase: UseCase;

    /**
     * parent useCase
     */
    parentUseCase: UseCase | null;

    private disptcher: Dispatcher;

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
     */
    constructor({
        useCase,
        parent,
        dispatcher
    }: UseCaseExecutorArgs) {
        // execute and finish =>
        const useCaseName = useCase.name;
        if (process.env.NODE_ENV !== "production") {
            assert.ok(typeof useCaseName === "string", "UseCase instance should have constructor.name " + useCase);
            assert.ok(typeof useCase.execute === "function", `UseCase instance should have #execute function: ${useCaseName}`);
        }

        this.useCase = useCase;
        this.parentUseCase = parent;
        this.disptcher = dispatcher;
        this._releaseHandlers = [];
        // delegate userCase#onDispatch to central dispatcher
        const unListenHandler = this.useCase.pipe(this.disptcher);
        this._releaseHandlers.push(unListenHandler);
    }

    /**
     * @param   [args] arguments of the UseCase
     */
    private _willExecute(args?: any[]): void {
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
     * @param   [value] result value of the useCase executed
     */
    private _didExecute(value?: any): void {
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
     * @param   [value] unwrapped result value of the useCase executed
     */
    private _complete(value?: any): void {
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
     * @param   handler
     */
    onWillExecuteEachUseCase(handler: (payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void {
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
     * @param   handler
     */
    onDidExecuteEachUseCase(handler: (payload: DidExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void {
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
     * @param   handler
     * @returns
     */
    onCompleteExecuteEachUseCase(handler: (payload: CompletedPayload, meta: DispatcherPayloadMeta) => void): () => void {
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
     */
    execute<R>(...args: Array<any>): Promise<void> {
        this._willExecute(args);
        const result: R = this.useCase.execute<R>(...args);
        // Sync call didExecute
        this._didExecute(result);
        // When UseCase#execute is completed, dispatch "complete".
        return Promise.resolve(result).then((result: R) => {
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
     */
    release(): void {
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
    }
}