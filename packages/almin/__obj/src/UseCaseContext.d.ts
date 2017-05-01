import { UseCase } from "./UseCase";
import { UseCaseExecutor } from "./UseCaseExecutor";
import { FunctionalUseCaseContext } from "./FunctionalUseCaseContext";
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
export declare class UseCaseContext {
    /**
     * The dispatcher for This Context
     * @private
     */
    private _dispatcher;
    /**
     * `dispatcher` is often parent `UseCase`.
     * The user can not create this instance directly.
     * The user can access this via `UseCase#context`
     *
     * **internal**
     */
    constructor(dispatcher: UseCase);
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
    useCase(useCase: (context: FunctionalUseCaseContext) => Function): UseCaseExecutor;
    useCase(useCase: UseCase): UseCaseExecutor;
}
