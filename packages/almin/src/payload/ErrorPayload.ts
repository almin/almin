// LICENSE : MIT
"use strict";
import { Payload } from "./Payload";

/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "__ALMIN_ERROR_PAYLOAD__";

/**
 * This payload is executed
 */
export class ErrorPayload implements Payload {
    type = TYPE;
    /**
     * the `error` in the UseCase
     */
    error: Error | any;

    constructor({ error }: { error?: Error | any }) {
        this.error = error;
    }
}

export function isErrorPayload(v: Payload): v is ErrorPayload {
    return v.type === TYPE;
}
