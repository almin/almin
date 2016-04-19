// LICENSE : MIT
"use strict";
const EventEmitter = require("events");
const assert = require("assert");
export const ON_DISPATCH = "__DISPATCH_ACTION__";
export default class CoreEventEmitter extends EventEmitter {
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
     * delegate payload object to EventEmitter.
     * @param {CoreEventEmitter} toEventEmitter
     * @returns {Function} un register function
     */
    pipe(toEventEmitter) {
        const fromName = this.constructor.name;
        const toName = toEventEmitter.constructor.name;
        const displayName = `delegate-payload:${fromName}-to-${toName}`;
        const delegatePayload = function delegatePayload(payload) {
            this.displayName = displayName;
            toEventEmitter.dispatch(payload);
        };
        return this.onDispatch(delegatePayload);
    }
}