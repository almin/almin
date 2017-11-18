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
    type: typeof TYPE;
    /**
     * the `error` in the UseCase
     */
    error: Error | any;

    constructor({ error }: { error?: Error | any }) {
        super({ type: TYPE });
        this.error = error;
    }
}

export function isErrorPayload(v: Payload): v is ErrorPayload {
    return v.type === TYPE;
}
