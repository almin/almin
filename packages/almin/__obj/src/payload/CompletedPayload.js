// LICENSE : MIT
"use strict";
import { Payload } from "./Payload";
/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "ALMIN__COMPLETED_EACH_USECASE__";
export class CompletedPayload extends Payload {
    constructor({ value }) {
        super({ type: TYPE });
        this.value = value;
    }
}
export function isCompletedPayload(v) {
    return v.type === TYPE;
}
