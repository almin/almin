// LICENSE : MIT
"use strict";
import { UseCase } from "./UseCase";
import { UseCaseExecutor } from "./UseCaseExecutor";
import { FunctionalUseCase } from "./FunctionalUseCase";
const assert = require("assert");
/**
 * Maybe, `UseCaseContext` is invisible from Public API.
 *
 * `UseCase#context` return UseCaseContext insteadof Context.
 * It has limitation as against to Context.
 * Because, `UseCaseContext` is for `UseCase`, is not for `Context`.
 *
 * ```js
 * class ParentUseCase extends UseCase {
 *     execute() {
 *         this.context; // <= This is a instance of UseCaseContext
 *     }
 * }
 * ```
 */
export class UseCaseContext {
    /**
     * `dispatcher` is often parent `UseCase`.
     * The user can not create this instance directly.
     * The user can access this via `UseCase#context`
     *
     * **internal**
     */
    constructor(dispatcher) {
        this._dispatcher = dispatcher;
    }
    useCase(useCase) {
        if (process.env.NODE_ENV !== "production") {
            assert(useCase !== this._dispatcher, `the useCase(${useCase}) should not equal this useCase(${this._dispatcher})`);
        }
        if (UseCase.isUseCase(useCase)) {
            return new UseCaseExecutor({
                useCase,
                parent: UseCase.isUseCase(this._dispatcher) ? this._dispatcher : null,
                dispatcher: this._dispatcher
            });
        }
        else if (typeof useCase === "function") {
            if (process.env.NODE_ENV !== "production") {
                // When pass UseCase constructor itself, throw assertion error
                assert.ok(Object.getPrototypeOf && Object.getPrototypeOf(useCase) !== UseCase, `Context#useCase argument should be instance of UseCase.
The argument is UseCase constructor itself: ${useCase}`);
            }
            // function to be FunctionalUseCase
            const functionalUseCase = new FunctionalUseCase(useCase, this._dispatcher);
            return new UseCaseExecutor({
                useCase: functionalUseCase,
                parent: UseCase.isUseCase(this._dispatcher) ? this._dispatcher : null,
                dispatcher: this._dispatcher
            });
        }
        throw new Error(`UseCaseContext#useCase argument should be UseCase: ${useCase}`);
    }
}
