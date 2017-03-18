// LICENSE : MIT
"use strict";

import { UseCase } from "./UseCase";
import { UseCaseExecutor } from "./UseCaseExecutor";
import { Dispatcher } from "./Dispatcher";

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
    _dispatcher: UseCase | Dispatcher;

    /**
     * `dispatcher` is often parent `UseCase`.
     * The user can not create this instance directly.
     * The user can access this via `UseCase#context`
     *
     * **internal**
     */
    constructor(dispatcher: UseCase | Dispatcher) {
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
    useCase(useCase: UseCase): UseCaseExecutor {
        if (process.env.NODE_ENV !== "production") {
            assert(useCase !== this._dispatcher, `the useCase(${useCase}) should not equal this useCase(${this._dispatcher})`);
        }
        return new UseCaseExecutor({
            useCase,
            parent: UseCase.isUseCase(this._dispatcher) ? this._dispatcher : null,
            dispatcher: this._dispatcher
        });
    }
}
