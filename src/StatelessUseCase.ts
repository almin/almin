// LICENSE : MIT
"use strict";
import { StatelessUseCaseContext } from "./StatelessUseCaseContext";
import { UseCaseLike } from "./UseCaseLike";
import { Dispatcher } from "./Dispatcher";
import { DispatcherPayloadMetaImpl } from "./DispatcherPayloadMeta";
import { ErrorPayload } from "./payload/ErrorPayload";
import { generateNewId } from "./UseCaseIdGenerator";

export const defaultUseCaseName = "<Stateless-UseCase>";

/**
 * Stateless|Functional version of UseCase class
 * It has some limitation by contrast to UseCase class
 *
 * - Can not use lifecycle hook
 * - Always willExecute `args` is null
 */
export class StatelessUseCase extends Dispatcher implements UseCaseLike {

    /**
     * unique id in each UseCase instances.
     */
    id: string;

    /**
     * Executor function
     */
    executor: Function;

    /**
     * Dispatcher
     */
    dispatcher: Dispatcher;

    /**
     * The default is UseCase name
     */
    name: string;

    constructor(executor: Function & {name?: string, displayName?: string}, dispatcher: Dispatcher) {
        super();
        this.dispatcher = dispatcher;
        this.executor = executor;
        this.id = generateNewId();
        this.name = executor.displayName || executor.name || defaultUseCaseName;
    }

    /**
     * execute stateless usecase
     */
    execute(): any {
        const context: StatelessUseCaseContext = {
            dispatcher: this.dispatcher
        };
        return this.executor(context);
    }

    /**
     * throw error event
     * you can use it instead of `throw new Error()`
     * this error event is caught by dispatcher.
     */
    throwError(error?: Error | any): void {
        const meta = new DispatcherPayloadMetaImpl({
            useCase: this,
            dispatcher: this,
            isTrusted: true
        });
        const payload = new ErrorPayload({
            error
        });
        this.dispatch(payload, meta);
    }
}
