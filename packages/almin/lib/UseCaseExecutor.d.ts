import { Dispatcher } from "./Dispatcher";
import { UseCase } from "./UseCase";
import { DispatcherPayloadMeta } from "./DispatcherPayloadMeta";
import { CompletedPayload } from "./payload/CompletedPayload";
import { DidExecutedPayload } from "./payload/DidExecutedPayload";
import { WillExecutedPayload } from "./payload/WillExecutedPayload";
import { UseCaseLike } from "./UseCaseLike";
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
export declare class UseCaseExecutor {
    /**
     * A executable useCase
     */
    private _useCase;
    /**
     * A parent useCase
     */
    private _parentUseCase;
    /**
     * A dispatcher instance
     */
    private _dispatcher;
    /**
     * callable release handlers that are called in release()
     */
    private _releaseHandlers;
    /**
     * @param   useCase
     * @param   parent
     *      parent is parent of `useCase`
     * @param   dispatcher
     * @public
     *
     * **internal** documentation
     */
    constructor({useCase, parent, dispatcher}: UseCaseExecutorArgs);
    /**
     * @param   [args] arguments of the UseCase
     */
    private _willExecute(args?);
    /**
     * dispatch did execute each UseCase
     */
    private _didExecute(isFinished, value?);
    /**
     * dispatch complete each UseCase
     * @param   [value] unwrapped result value of the useCase executed
     */
    private _complete(value?);
    /**
     * called the {@link handler} with useCase when the useCase will do.
     * @param   handler
     */
    onWillExecuteEachUseCase(handler: (payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void;
    /**
     * called the `handler` with useCase when the useCase is executed.
     * @param   handler
     */
    onDidExecuteEachUseCase(handler: (payload: DidExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void;
    /**
     * called the `handler` with useCase when the useCase is completed.
     * @param   handler
     * @returns
     */
    onCompleteExecuteEachUseCase(handler: (payload: CompletedPayload, meta: DispatcherPayloadMeta) => void): () => void;
    /**
     * execute UseCase instance.
     * UseCase is a executable object. it means that has `execute` method.
     * Notes: UseCaseExecutor doesn't return resolved value by design
     */
    execute(): Promise<void>;
    execute<T>(args: T): Promise<void>;
    /**
     * release all events handler.
     * You can call this when no more call event handler
     */
    release(): void;
}
