// LICENSE : MIT
"use strict";
import { Dispatcher } from "./Dispatcher";
import { DispatchedPayload } from "./Dispatcher";
import { UseCaseContext } from "./UseCaseContext";
import { DispatcherPayloadMeta, DispatcherPayloadMetaImpl } from "./DispatcherPayloadMeta";
import { ErrorPayload, isErrorPayload } from "./payload/ErrorPayload";
import { UseCaseLike } from "./UseCaseLike";
import { generateNewId } from "./UseCaseIdGenerator";

export const defaultUseCaseName = "<Anonymous-UseCase>";


export const isUseCase = (v: any): v is UseCase => {
    if (v instanceof UseCase) {
        return true;
    } else if (typeof v === "object" && typeof v.execute === "function") {
        return true;
    }
    return false;
};

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
export abstract class UseCase extends Dispatcher implements UseCaseLike {

    /**
     * Debuggable name if it needed
     */
    static displayName?: string;

    /**
     * Return true if the `v` is a UseCase-like.
     */
    static isUseCase(v: any): v is UseCase {
        return isUseCase(v);
    }


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
    constructor() {
        super();

        this.id = generateNewId();
        const own = this.constructor as typeof UseCase;
        this.name = own.displayName || own.name || defaultUseCaseName;
    }


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
    get context(): UseCaseContext {
        return new UseCaseContext(this);
    }

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
    execute(..._: Array<any>): any {
        throw new TypeError(`should be overwrite ${this.constructor.name}#execute()`);
    }

    /**
     * Dispatch `payload` object.
     *
     * `Store` or `Context` can receive the `payload` object.n
     */
    dispatch(payload: DispatchedPayload, meta?: DispatcherPayloadMeta) {
        // system dispatch has meta
        // But, when meta is empty, the `payload` object generated by user
        const useCaseMeta = meta
            ? meta
            : new DispatcherPayloadMetaImpl({
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
        super.dispatch(payload, useCaseMeta);
    }

    /**
     * `errorHandler` is called with error when error is thrown.
     */
    onError(errorHandler: (error: Error) => void): (this: Dispatcher) => void {
        return this.onDispatch(payload => {
            if (isErrorPayload(payload)) {
                errorHandler((payload).error);
            }
        });
    }

    /**
     * Throw error payload.
     *
     * You can use it instead of `throw new Error()`
     * This error event is caught by dispatcher.
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
