// LICENSE : MIT
"use strict";
import { Payload } from "./Payload";
/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "ALMIN__WILL_EXECUTED_EACH_USECASE__";
export class WillExecutedPayload extends Payload {
    constructor({ args = [] }) {
        super({ type: TYPE });
        this.args = args;
    }
}
export function isWillExecutedPayload(v) {
    return v.type === TYPE;
}
