import { Dispatcher } from "./Dispatcher";
import { DispatchedPayload } from "./Dispatcher";
import { UseCaseContext } from "./UseCaseContext";
import { DispatcherPayloadMeta } from "./DispatcherPayloadMeta";
import { UseCaseLike } from "./UseCaseLike";
export declare const defaultUseCaseName = "<Anonymous-UseCase>";
/**
 * A `UseCase` class is inherited Dispatcher.
 * The user implement own user-case that is inherited UseCase class
 *
 * It similar to ActionCreator on Flux.
 *
 * ### Example
 *
 * ```js
 * import {UseCase} from "almin";
 * class AwesomeUseCase extends UseCase {
 *    execute(){
 *       // implementation own use-case
 *   }
 * }
 * ```
 */
export declare abstract class UseCase extends Dispatcher implements UseCaseLike {
    /**
     * Debuggable name if it needed
     */
    static displayName?: string;
    /**
     * Return true if the `v` is a UseCase-like.
     */
    static isUseCase(v: any): v is UseCase;
    /**
     * Unique id in each UseCase instances.
     */
    id: string;
    /**
     * The name of the UseCase.
     */
    name: string;
    /**
     * Constructor not have arguments.
     */
    constructor();
    /**
     * Get `context` of UseCase.
     * You can execute sub UseCase using UseCaseContext object.
     *
     * See following for more details.
     *
     * - [UseCaseContext](https://almin.js.org/docs/api/UseCaseContext.html)
     * - [Nesting UseCase](https://almin.js.org/docs/tips/nesting-usecase.html)
     *
     * ### Example
     *
     * ```js
     * // Parent -> ChildUseCase
     * export class ParentUseCase extends UseCase {
     *     execute() {
     *         // execute child use-case using UseCaseContext object.
     *         return this.context.useCase(new ChildUseCase()).execute();
     *     }
     * }
     * export class ChildUseCase extends UseCase {
     *     execute() {
     *         this.dispatch({
     *             type: "ChildUseCase"
     *         });
     *     }
     * }
     * ```
     */
    readonly context: UseCaseContext;
    /**
     * `UseCase#execute()` method should be overwrite by subclass.
     *
     * ### Example
     *
     * ```js
     * class AwesomeUseCase extends UseCase {
     *    execute(){
     *       // implementation own use-case
     *   }
     * }
     * ```
     *
     *  FIXME: mark this as `abstract` property.
     */
    execute(..._: Array<any>): any;
    /**
     * Dispatch `payload` object.
     *
     * `Store` or `Context` can receive the `payload` object.n
     */
    dispatch(payload: DispatchedPayload, meta?: DispatcherPayloadMeta): void;
    /**
     * `errorHandler` is called with error when error is thrown.
     */
    onError(errorHandler: (error: Error) => void): (this: Dispatcher) => void;
    /**
     * Throw error payload.
     *
     * You can use it instead of `throw new Error()`
     * This error event is caught by dispatcher.
     */
    throwError(error?: Error | any): void;
}
