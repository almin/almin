// LICENSE : MIT
"use strict";
import { Payload } from "./Payload";

/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "__ALMIN_WILL_NOT_EXECUTE_USECASE__";

export class WillNotExecutedPayload implements Payload {
    type = TYPE;
    /**
     * a array for argument of the useCase
     */
    args: Array<any>;

    constructor({ args = [] }: { args?: Array<any> }) {
        this.args = args;
    }
}

export function isWillNotExecutedPayload(v: Payload): v is WillNotExecutedPayload {
    return v.type === TYPE;
}
