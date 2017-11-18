// LICENSE : MIT
"use strict";
import { Payload } from "./Payload";

/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "ALMIN__COMPLETED_EACH_USECASE__";

export class CompletedPayload extends Payload {
    type: typeof TYPE;
    /**
     * the value is returned by the useCase
     * Difference of DidExecutedPayload, the value always is resolved value.
     * Promise.resolve(returnedValue).then(value => {
     *  // `value` is this value
     * })
     */
    value: any | undefined;

    constructor({ value }: { value?: any }) {
        super({ type: TYPE });
        this.value = value;
    }
}

export function isCompletedPayload(v: Payload): v is CompletedPayload {
    return v.type === TYPE;
}
