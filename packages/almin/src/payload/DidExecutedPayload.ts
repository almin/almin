// LICENSE : MIT
"use strict";
import { Payload } from "./Payload";

/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "ALMIN__DID_EXECUTED_EACH_USECASE__";

export class DidExecutedPayload extends Payload {
    /**
     * the value is returned by the useCase
     * Maybe Promise or some value or undefined.
     * If you want to know unwrapped promise value, please see CompletedPayload.
     */
    value: any | undefined;

    constructor({ value }: { value?: any; }) {
        super({ type: TYPE });
        this.value = value;
    }
}

export function isDidExecutedPayload(v: Payload): v is DidExecutedPayload {
    return v.type === TYPE;
}