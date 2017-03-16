// LICENSE : MIT
"use strict";
import { FunctionalUseCaseContext } from "./FunctionalUseCaseContext";
import { UseCaseLike } from "./UseCaseLike";
import { Dispatcher } from "./Dispatcher";
import { generateNewId } from "./UseCaseIdGenerator";
import { DispatcherPayloadMetaImpl } from "./DispatcherPayloadMeta";
import { ErrorPayload } from "./payload/ErrorPayload";

export const defaultUseCaseName = "<Functiona-UseCase>";

/**
 * Functional version of UseCase class.
 * The user pass a function as UseCase
 * @example
 *
 * const functionalUseCase = ({ dispatcher }) => {
 *   return (...args) => {
 *      dispatcher.dispatch({ type: "fire" });
 *   }
 * }
 *
 */
export class FunctionalUseCase extends Dispatcher implements UseCaseLike {

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

    constructor(functionUseCase: Function & {name?: string, displayName?: string}, dispatcher: Dispatcher) {
        super();
        const context: FunctionalUseCaseContext = {
            dispatcher
        };
        this.dispatcher = dispatcher;
        /*
            const functionalUseCase = ({ dispatcher }) => {
                return (...args) => { } // <= executor
            }
         */
        this.executor = functionUseCase(context);
        this.id = generateNewId();
        this.name = functionUseCase.displayName || functionUseCase.name || defaultUseCaseName;
    }

    /**
     * execute functional UseCase
     */
    execute<R>(..._: Array<any>): R {
        return this.executor(..._);
    }

    /**
     * implementation throwError
     * @param error
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
