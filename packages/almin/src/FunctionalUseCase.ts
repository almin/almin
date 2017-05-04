// LICENSE : MIT
"use strict";
import { FunctionalUseCaseContext } from "./FunctionalUseCaseContext";
import { UseCaseLike } from "./UseCaseLike";
import { Dispatcher } from "./Dispatcher";
import { generateNewId } from "./UseCaseIdGenerator";
import { DispatcherPayloadMetaImpl } from "./DispatcherPayloadMeta";
import { ErrorPayload } from "./payload/ErrorPayload";
import * as assert from "assert";

export const defaultUseCaseName = "<Functiona-UseCase>";
export type UseCaseArgs = (context: FunctionalUseCaseContext) => Function;
const getFunctionalExecute = (functionalUseCase: UseCaseArgs, context: FunctionalUseCaseContext): Function => {
    try {
        const execute = functionalUseCase(context);
        if (process.env.NODE_ENV !== "production") {
            console.error("Wrong Functional UseCase:", functionalUseCase);
            const message = `Functional UseCase should return executor function.
Example:
    
    const useCase = ({ dispatcher }) => {
        return (args) => {
            // execute
        }
    };
    
    context.useCase(useCase).execute("args");
`;
            assert.ok(typeof execute, message)
        }
        return execute;
    } catch (error) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Wrong Functional UseCase:", functionalUseCase,
                `Functional UseCase should return executor function.
Example:
    
    const useCase = ({ dispatcher }) => {
        return (args) => {
            // execute
        }
    };
    
    context.useCase(useCase).execute("args");
`);
        }
        throw error;
    }
};
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

    constructor(functionUseCase: (context: FunctionalUseCaseContext) => Function, dispatcher: Dispatcher) {
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
        this.executor = getFunctionalExecute(functionUseCase, context);
        this.id = generateNewId();
        this.name = (functionUseCase as any).displayName || functionUseCase.name || defaultUseCaseName;
    }

    /**
     * execute functional UseCase
     */
    execute(..._: Array<any>): any {
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
            isTrusted: true,
            isUseCaseFinished: false
        });
        const payload = new ErrorPayload({
            error
        });
        this.dispatch(payload, meta);
    }
}
