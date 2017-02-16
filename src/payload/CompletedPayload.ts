// LICENSE : MIT
"use strict";
import Payload from "./Payload";

export const TYPE = "ALMIN__COMPLETED_EACH_USECASE__";

export default class CompletedPayload extends Payload {

    static get Type(): typeof TYPE {
        return TYPE;
    }

    /**
     * the value is returned by the useCase
     * Difference of DidExecutedPayload, the value always is resolved value.
     * Promise.resolve(returnedValue).then(value => {
     *  // `value` is this value
     * })
     */
    value: any | undefined;

    constructor({ value }: { value?: any; }) {
        super({ type: TYPE });
        this.value = value;
    }
}