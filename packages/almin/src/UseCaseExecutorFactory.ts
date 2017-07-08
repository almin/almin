import { UseCaseExecutor } from "./UseCaseExecutor";
import { UseCaseFunction } from "./FunctionalUseCaseContext";
import { FunctionalUseCase } from "./FunctionalUseCase";
import { UseCaseLike } from "./UseCaseLike";
import { isUseCase, UseCase } from "./UseCase";
import * as assert from "assert";
import { Dispatcher } from "./Dispatcher";

export function createUseCaseExecutor(useCase: UseCaseFunction, dispatcher: Dispatcher): UseCaseExecutor<FunctionalUseCase>;
export function createUseCaseExecutor<T extends UseCaseLike>(useCase: T, dispatcher: Dispatcher): UseCaseExecutor<T>;
export function createUseCaseExecutor(useCase: any, dispatcher: Dispatcher): UseCaseExecutor<any> {
    // instance of UseCase
    if (isUseCase(useCase)) {
        return new UseCaseExecutor({
            useCase,
            parent: isUseCase(dispatcher) ? dispatcher : null,
            dispatcher
        });
    } else if (typeof useCase === "function") {
        // When pass UseCase constructor itself, throw assertion error
        assert.ok(Object.getPrototypeOf && Object.getPrototypeOf(useCase) !== UseCase,
            `Context#useCase argument should be instance of UseCase.
The argument is UseCase constructor itself: ${useCase}`
        );
        // function to be FunctionalUseCase
        const functionalUseCase = new FunctionalUseCase(useCase);
        return new UseCaseExecutor({
            useCase: functionalUseCase,
            parent: isUseCase(dispatcher) ? dispatcher : null,
            dispatcher
        });
    }
    throw new Error(`Context#useCase argument should be UseCase: ${useCase}`);

}
