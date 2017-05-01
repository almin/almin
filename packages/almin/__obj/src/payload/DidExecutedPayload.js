// LICENSE : MIT
"use strict";
import { Payload } from "./Payload";
/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "ALMIN__DID_EXECUTED_EACH_USECASE__";
export class DidExecutedPayload extends Payload {
    constructor({ value }) {
        super({ type: TYPE });
        this.value = value;
    }
}
export function isDidExecutedPayload(v) {
    return v.type === TYPE;
}
