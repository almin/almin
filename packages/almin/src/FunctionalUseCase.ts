// LICENSE : MIT
"use strict";
import { FunctionalUseCaseContext } from "./FunctionalUseCaseContext";
import { UseCaseLike } from "./UseCaseLike";
import { Dispatcher } from "./Dispatcher";
import { generateNewId } from "./UseCaseIdGenerator";
import { DispatcherPayloadMetaImpl } from "./DispatcherPayloadMeta";
import { ErrorPayload } from "./payload/ErrorPayload";
import * as assert from "assert";
import { Payload } from "./payload/Payload";

export const defaultUseCaseName = "<Functiona-UseCase>";
export type UseCaseArgs = (context: FunctionalUseCaseContext) => Function;
const getFunctionalExecute = (functionalUseCase: UseCaseArgs, context: FunctionalUseCaseContext): Function => {
    try {
        const execute = functionalUseCase(context);
        if (process.env.NODE_ENV !== "production") {
            assert.ok(typeof execute === "function", "Functional UseCase should return a executor function.");
        }
        return execute;
    } catch (error) {
        if (process.env.NODE_ENV !== "production") {
            console.error(`Warning(UseCase): This is wrong Functional UseCase.
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

    constructor(functionUseCase: (context: FunctionalUseCaseContext) => Function) {
        super();
        const dispatcher = {
            dispatch: (payload: Payload) => {
                // system dispatch has meta
                // But, when meta is empty, the `payload` object generated by user
                const useCaseMeta = new DispatcherPayloadMetaImpl({
                    // this dispatch payload generated by this UseCase
                    useCase: this,
                    // dispatcher is the UseCase
                    dispatcher: this,
                    // parent is the same with UseCase. because this useCase dispatch the payload
                    parentUseCase: null,
                    // the user create this payload
                    isTrusted: false,
                    // Always false because the payload is dispatched from this working useCase.
                    isUseCaseFinished: false
                });
                this.dispatch(payload, useCaseMeta);
            }
        };
        const context: FunctionalUseCaseContext = {
            dispatcher
        };
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
