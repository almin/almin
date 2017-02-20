// LICENSE : MIT
"use strict";
import Payload from "./Payload";

export const TYPE = "ALMIN__DID_EXECUTED_EACH_USECASE__";

export default class DidExecutedPayload extends Payload {

    static get Type(): typeof TYPE {
        return TYPE;
    }

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