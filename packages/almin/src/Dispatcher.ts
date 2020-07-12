// LICENSE : MIT
"use strict";
import { DispatcherPayloadMeta, DispatcherPayloadMetaImpl } from "./DispatcherPayloadMeta";

import { Payload } from "./payload/Payload";
import { ErrorPayload } from "./payload/ErrorPayload";
import { CompletedPayload } from "./payload/CompletedPayload";
import { DidExecutedPayload } from "./payload/DidExecutedPayload";
import { WillExecutedPayload } from "./payload/WillExecutedPayload";
import { TransactionBeganPayload } from "./payload/TransactionBeganPayload";
import { TransactionEndedPayload } from "./payload/TransactionEndedPayload";
import { StoreChangedPayload } from "./payload/StoreChangedPayload";
import { AnyPayload } from "./payload/AnyPayload";
import { assertOK } from "./util/assert";
import { Events } from "./Events";

/**
 * Payload object types.
 *
 * Almin has some built-in Payload class like `ErrorPayload`.
 * @private
 */
export type DispatchedPayload =
    | Payload
    | AnyPayload
    | ErrorPayload
    | CompletedPayload
    | DidExecutedPayload
    | WillExecutedPayload
    | TransactionBeganPayload
    | TransactionEndedPayload
    | StoreChangedPayload;

type DispatcherEvent = {
    payload: DispatchedPayload;
    meta: DispatcherPayloadMeta;
};

/**
 * Dispatcher is the **central** event bus system.
 *
 * `Dispatcher` class  have these method.
 *
 * - `onDispatch(function(payload){ });`
 * - `dispatch(payload);`
 *
 * Dispatcher pass `payload` object and `meta` object.
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
 * ## PayloadMeta
 *
 * `meta` object represent meta information for payload
 * PayloadMeta is created automatically when that payload is dispatched.
 *
 * ### FAQ
 *
 * Q. Why Almin use `payload` object instead `emit(key, ...args)`?
 *
 * A. It is for optimization and limitation.
 * If apply emit style, we should cast `...args` for passing other dispatcher at every time.
 * So, Almin use `payload` object instead of it without casting.
 */
export class Dispatcher extends Events<DispatcherEvent> {
    /**
     * if `v` is instance of Dispatcher, return true
     */
    static isDispatcher(v: any): v is Dispatcher {
        if (v instanceof Dispatcher) {
            return true;
        } else if (typeof v === "object" && typeof v.onDispatch === "function" && typeof v.dispatch === "function") {
            return true;
        }
        return false;
    }

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
    onDispatch(handler: (payload: DispatchedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        return this.addEventListener((event) => handler(event.payload, event.meta));
    }

    /**
     * Dispatch `payload` to subscribers.
     */
    dispatch(payload: DispatchedPayload, meta?: DispatcherPayloadMeta): void {
        if (process.env.NODE_ENV !== "production") {
            assertOK(payload !== undefined && payload !== null, "payload should not null or undefined");
            assertOK(typeof payload.type !== "undefined", "payload's `type` should be required");
            if (meta !== undefined) {
                assertOK(meta instanceof DispatcherPayloadMetaImpl, "`meta` object is internal arguments.");
            }
        }
        // `meta` must be generated by system
        if (meta instanceof DispatcherPayloadMetaImpl) {
            this.emit({
                payload,
                meta
            });
        } else {
            // the `payload` object generated by user
            const dispatchOnlyMeta = new DispatcherPayloadMetaImpl({
                isTrusted: false
            });
            this.emit({
                payload,
                meta: dispatchOnlyMeta
            });
        }
    }

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
    pipe(toDispatcher: Dispatcher): () => void {
        const fromName = this.constructor.name;
        const toName = toDispatcher.constructor.name;
        const displayName = `delegate-payload:${fromName}-to-${toName}`;

        type DelegatePayloadFn = {
            (payload: DispatchedPayload, meta: DispatcherPayloadMeta): void;
            displayName: string;
        };
        const delegatePayload = function delegatePayload(payload: DispatchedPayload, meta: DispatcherPayloadMeta) {
            (delegatePayload as DelegatePayloadFn).displayName = displayName;
            toDispatcher.dispatch(payload, meta);
        };
        return this.onDispatch(delegatePayload);
    }
}
