import { UseCaseExecutorImpl } from "./UseCaseExecutor";
import { isUseCaseFunction, UseCaseFunction } from "./FunctionalUseCaseContext";
import { FunctionalUseCase } from "./FunctionalUseCase";
import { isUseCase, UseCase } from "./UseCase";
import * as assert from "assert";
import { Dispatcher } from "./Dispatcher";

export function createUseCaseExecutor(
    useCase: UseCaseFunction,
    dispatcher: Dispatcher
): UseCaseExecutorImpl<FunctionalUseCase>;
export function createUseCaseExecutor<T extends UseCase>(useCase: T, dispatcher: Dispatcher): UseCaseExecutorImpl<T>;
export function createUseCaseExecutor(useCase: any, dispatcher: Dispatcher): UseCaseExecutorImpl<any> {
    // instance of UseCase
    if (isUseCase(useCase)) {
        return new UseCaseExecutorImpl({
            useCase,
            parent: isUseCase(dispatcher) ? dispatcher : null
        });
    } else if (isUseCaseFunction(useCase)) {
        // When pass UseCase constructor itself, throw assertion error
        assert.ok(
            Object.getPrototypeOf && Object.getPrototypeOf(useCase) !== UseCase,
            `Context#useCase argument should be instance of UseCase.
The argument is UseCase constructor itself: ${useCase}`
        );
        // function to be FunctionalUseCase
        const functionalUseCase = new FunctionalUseCase(useCase);
        return new UseCaseExecutorImpl({
            useCase: functionalUseCase,
            parent: isUseCase(dispatcher) ? dispatcher : null
        });
    }
    throw new Error(`Context#useCase argument should be UseCase: ${useCase}`);
}
