/// <reference types="node" />
import { EventEmitter } from "events";
import { DispatcherPayloadMeta } from "./DispatcherPayloadMeta";
import { Payload } from "./payload/Payload";
import { ErrorPayload } from "./payload/ErrorPayload";
import { CompletedPayload } from "./payload/CompletedPayload";
import { DidExecutedPayload } from "./payload/DidExecutedPayload";
import { WillExecutedPayload } from "./payload/WillExecutedPayload";
/**
 * @private
 */
export declare const ON_DISPATCH = "__ON_DISPATCH__";
/**
 * Payload object types.
 *
 * Almin has some built-in Payload class like `ErrorPayload`.
 * @private
 */
export declare type DispatchedPayload = Payload | ErrorPayload | CompletedPayload | DidExecutedPayload | WillExecutedPayload;
/**
 * Dispatcher is the **central** event bus system.
 *
 * `Dispatcher` class  have these method.
 *
 * - `onDispatch(function(payload){ });`
 * - `dispatch(payload);`
 *
 * It is similar with EventEmitter of Node.js
 * But, Dispatcher use `payload` object as arguments.
 *
 * ## Payload
 *
 * `payload` object must have `type` property.
 * Following object is a minimal `payload` object.
 *
 * ```json
 * {
 *     "type": "type"
 * }
 * ```
 *
 * Also, You can put any property to payload object.
 *
 * ```json
 * {
 *     "type": "show",
 *     "value": "value"
 * }
 * ```
 *
 * ### FAQ
 *
 * Q. Why Almin use `payload` object instead `emit(key, ...args)`?
 *
 * A. It is for optimization and limitation.
 * If apply emit style, we should cast `...args` for passing other dispatcher at every time.
 * So, Almin use `payload` object instead of it without casting.
 */
export declare class Dispatcher extends EventEmitter {
    /**
     * if `v` is instance of Dispatcher, return true
     */
    static isDispatcher(v: any): v is Dispatcher;
    /**
     * constructor not have arguments.
     **/
    constructor();
    /**
     * Add `handler`(subscriber) to Dispatcher and return unsubscribe function
     *
     * ### Example
     *
     * ```js
     * const dispatcher = new Dispatcher();
     * const unsubscribe = dispatcher.onDispatch((payload, meta) => {});
     * unsubscribe(); // release handler
     * ```
     */
    onDispatch(handler: (payload: DispatchedPayload, meta: DispatcherPayloadMeta) => void): () => void;
    /**
     * Dispatch `payload` to subscribers.
     */
    dispatch(payload: DispatchedPayload, meta?: DispatcherPayloadMeta): void;
    /**
     * Delegate payload object to other dispatcher.
     *
     * ### Example
     *
     * ```js
     * const a = new Dispatcher();
     * const b = new Dispatcher();
     * // Delegate `a` to `b`
     * a.pipe(b);
     * // dispatch and `b` can receive it.
     * a.dispatch({ type : "a" });
     * ```
     */
    pipe(toDispatcher: Dispatcher): () => void;
}
