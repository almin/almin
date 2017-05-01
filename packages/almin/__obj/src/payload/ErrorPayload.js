// LICENSE : MIT
"use strict";
import { Payload } from "./Payload";
/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "ALMIN__ErrorPayload__";
/**
 * This payload is executed
 */
export class ErrorPayload extends Payload {
    constructor({ error }) {
        super({ type: TYPE });
        this.error = error;
    }
}
export function isErrorPayload(v) {
    return v.type === TYPE;
}
