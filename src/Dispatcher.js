// LICENSE : MIT
"use strict";
const assert = require("assert");
const EventEmitter = require("events");
export const ON_DISPATCH = "__ON_DISPATCH__";
/**
 * payload The payload object that must have `type` property.
 * @typedef {Object} DispatcherPayload
 * @property {String} type The event type to dispatch.
 */
/**
 * Dispatcher is the **central** event bus system.
 *
 * also have these method.
 *
 * - onDispatch(payloadHandler): Function
 * - dispatch(payload): void
 *
 * Almost event pass the (on)dispatch.
 *
 * ## FAQ
 *
 * Q. Why use payload object instead emit(key, ...args).
 * A. It is for optimization and limitation.
 * If apply emit style, we cast ...args for passing other dispatcher at every time.
 */
export default class Dispatcher extends EventEmitter {
    /**
     * if {@link v} is instance of Dispatcher, return true
     * @param {Dispatcher|*} v
     * @returns {boolean}
     */
    static isDispatcher(v) {
        if (v instanceof Dispatcher) {
            return true;
        } else if (typeof v === "object" && typeof v.onDispatch === "function" && typeof v.dispatch === "function") {
            return true;
        }
        return false;
    }

    /**
     * add onAction handler and return unbind function
     * @param {Function} payloadHandler
     * @returns {Function} return unbind function
     */
    onDispatch(payloadHandler) {
        this.on(ON_DISPATCH, payloadHandler);
        return this.removeListener.bind(this, ON_DISPATCH, payloadHandler);
    }

    /**
     * dispatch action object.
     * StoreGroups receive this action and reduce state.
     * @param {DispatcherPayload} payload
     */
    dispatch(payload) {
        assert(payload !== undefined && payload !== null, "payload should not null or undefined");
        assert(typeof payload.type === "string", "payload's type should be string");
        this.emit(ON_DISPATCH, payload);
    }

    /**
     * delegate payload object to other dispatcher.
     * @param {Dispatcher} toDispatcher
     * @returns {Function} un register function
     */
    pipe(toDispatcher) {
        const fromName = this.constructor.name;
        const toName = toDispatcher.constructor.name;
        const displayName = `delegate-payload:${fromName}-to-${toName}`;
        const delegatePayload = function delegatePayload(payload) {
            delegatePayload.displayName = displayName;
            toDispatcher.dispatch(payload);
        };
        return this.onDispatch(delegatePayload);
    }
}