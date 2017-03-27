// LICENSE : MIT
"use strict";

import { UseCase } from "./UseCase";
import { UseCaseExecutor, UseCaseExecutorImpl } from "./UseCaseExecutor";
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
     * The dispatcher for This Context
     * @private
     */
    private _dispatcher: UseCase;

    /**
     * `dispatcher` is often parent `UseCase`.
     * The user can not create this instance directly.
     * The user can access this via `UseCase#context`
     *
     * **internal**
     */
    constructor(dispatcher: UseCase) {
        this._dispatcher = dispatcher;
    }

    /**
     * Create UseCaseExecutor for `useCase`.
     *
     * It can be used for transaction between UseCases.
     *
     * ### Example
     *
     * ParentUseCase execute ChildUseCase.
     * It is called **Nesting UseCase**.
     *
     * ```js
     * // Parent -> ChildUseCase
     * export class ParentUseCase extends UseCase {
     *     execute() {
     *         // `this.context` is a instance of UseCaseContext.
     *         return this.context.useCase(new childUseCase()).execute();
     *     }
     * }
     *
     * export class ChildUseCase extends UseCase {
     *     execute() {
     *         this.dispatch({
     *             type: "ChildUseCase"
     *         });
     *     }
     * }
     * ```
     */
    useCase<T extends UseCase>(useCase: T): UseCaseExecutor<T>;
    useCase(useCase: any): UseCaseExecutor<any> {
        if (process.env.NODE_ENV !== "production") {
            assert(useCase !== this._dispatcher, `the useCase(${useCase}) should not equal this useCase(${this._dispatcher})`);
        }
        if (!UseCase.isUseCase(useCase)) {
            throw new Error("this.context.useCase support only UseCase class")
        }
        return new UseCaseExecutorImpl<typeof useCase>({
            useCase,
            parent: UseCase.isUseCase(this._dispatcher) ? this._dispatcher : null,
            dispatcher: this._dispatcher
        });
    }
}
