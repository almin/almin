// LICENSE : MIT
"use strict";
const assert = require("assert");
const EventEmitter = require("events");
export const ON_WILL_DISPATCH = "ON_WILL_DISPATCH";
export const ON_DISPATCH = "ON_DISPATCH";
export const ON_DID_DISPATCH = "ON_DID_DISPATCH";
/**
 * payload The payload object that must have `type` property.
 * @typedef {Object} DispatcherPayload
 * @property {*} type The event type to dispatch.
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
 * ## FAQ
 *
 * Q. Why use payload object instead emit(key, ...args).
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
     * register onWillDispatch handler and return unbind function
     * @param {function(payload: DispatcherPayload)} payloadHandler
     * @returns {Function} call the function and release handler
     * @public
     */
    onWillDispatch(payloadHandler) {
        this.on(ON_WILL_DISPATCH, payloadHandler);
        return this.removeListener.bind(this, ON_WILL_DISPATCH, payloadHandler);
    }

    /**
     * register onDispatch handler and return unbind function
     * @param {function(payload: DispatcherPayload)} payloadHandler
     * @returns {Function} call the function and release handler
     * @public
     */
    onDispatch(payloadHandler) {
        this.on(ON_DISPATCH, payloadHandler);
        return this.removeListener.bind(this, ON_DISPATCH, payloadHandler);
    }

    /**
     * register onDidDispatch handler and return unbind function
     * @param {function(payload: DispatcherPayload)} payloadHandler
     * @returns {Function} call the function and release handler
     * @public
     */
    onDidDispatch(payloadHandler) {
        this.on(ON_DID_DISPATCH, payloadHandler);
        return this.removeListener.bind(this, ON_DID_DISPATCH, payloadHandler);
    }

    /**
     * dispatch action object.
     * StoreGroups receive this action and reduce state.
     * @param {DispatcherPayload} payload
     * @public
     */
    dispatch(payload) {
        assert(payload !== undefined && payload !== null, "payload should not null or undefined");
        assert(typeof payload.type !== "undefined", "payload's `type` should be required");
        this.emit(ON_WILL_DISPATCH, payload);
        this.emit(ON_DISPATCH, payload);
        this.emit(ON_DID_DISPATCH, payload);
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
        const delegatePayload = function delegatePayload(payload) {
            delegatePayload.displayName = displayName;
            toDispatcher.dispatch(payload);
        };
        return this.onDispatch(delegatePayload);
    }
}