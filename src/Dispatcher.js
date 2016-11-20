// LICENSE : MIT
"use strict";
const assert = require("assert");
const EventEmitter = require("events");
import DispatcherPayloadMeta from "./DispatcherPayloadMeta";
export const ON_DISPATCH = "__ON_DISPATCH__";
/**
 * DispatcherPayload is an object.
 * The payload object that must have `type` property.
 * `type` property is a good idea to use string constants or Symbol for dispatch types.
 * @typedef {Object} DispatcherPayload
 * @public
 */
/**
 * Dispatcher is the **central** event bus system.
 *
 * also have these method.
 *
 * - `onDispatch(function(payload){  });`
 * - `dispatch(payload);`
 *
 * Almost event pass the (on)dispatch.
 *
 * ### FAQ
 *
 * Q. Why use `DispatcherPayload` object instead emit(key, ...args).
 *
 * A. It is for optimization and limitation.
 * If apply emit style, we cast ...args for passing other dispatcher at every time.
 * @public
 */
export default class Dispatcher extends EventEmitter {
    /**
     * if {@link v} is instance of Dispatcher, return true
     * @param {Dispatcher|*} v
     * @returns {boolean}
     * @public
     */
    static isDispatcher(v) {
        if (v instanceof Dispatcher) {
            return true;
        } else if (typeof v === "object" && typeof v.onDispatch === "function" && typeof v.dispatch === "function") {
            return true;
        }
        return false;
    }

    constructor() {
        super();
        // suppress: memory leak warning of EventEmitter
        // Dispatcher can listen more than 10 events
        this.setMaxListeners(0);
    }

    /**
     * add onAction handler and return unbind function
     * @param {function(payload: DispatcherPayload, meta: DispatcherPayloadMeta)} handler
     * @returns {Function} call the function and release handler
     * @public
     */
    onDispatch(handler) {
        this.on(ON_DISPATCH, handler);
        return this.removeListener.bind(this, ON_DISPATCH, handler);
    }

    /**
     * dispatch action object.
     * StoreGroups receive this action and reduce state.
     * @param {DispatcherPayload} payload
     * @param {DispatcherPayloadMeta} [meta]
     * @public
     */
    dispatch(payload, meta) {
        if (process.env.NODE_ENV !== "production") {
            assert(payload !== undefined && payload !== null, "payload should not null or undefined");
            assert(typeof payload.type !== "undefined", "payload's `type` should be required");
        }
        if (meta === undefined) {
            const dispatchOnlyMeta = new DispatcherPayloadMeta();
            this.emit(ON_DISPATCH, payload, dispatchOnlyMeta);
        } else {
            this.emit(ON_DISPATCH, payload, meta);
        }
    }

    /**
     * delegate payload object to other dispatcher.
     * @param {Dispatcher} toDispatcher
     * @returns {Function} call the function and release handler
     * @public
     */
    pipe(toDispatcher) {
        const fromName = this.constructor.name;
        const toName = toDispatcher.constructor.name;
        const displayName = `delegate-payload:${fromName}-to-${toName}`;
        const delegatePayload = function delegatePayload(payload, meta) {
            delegatePayload.displayName = displayName;
            toDispatcher.dispatch(payload, meta);
        };
        return this.onDispatch(delegatePayload);
    }
}