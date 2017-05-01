// LICENSE : MIT
"use strict";
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
export class FunctionalUseCase extends Dispatcher {
    constructor(functionUseCase, dispatcher) {
        super();
        const context = {
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
    execute(..._) {
        return this.executor(..._);
    }
    /**
     * implementation throwError
     * @param error
     */
    throwError(error) {
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
