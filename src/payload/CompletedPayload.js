// LICENSE : MIT
"use strict";
import Payload from "./Payload";
export default class CompletedPayload extends Payload {
    /**
     * @return {string}
     */
    static get Type() {
        return "ALMIN__COMPLETED_EACH_USECASE__";
    }

    /**
     * @param {*} [value]
     */
    constructor({ value }) {
        super({ type: CompletedPayload.Type });
        /**
         * the value is returned by the useCase
         * Difference of DidExecutedPayload, the value always is resolved value.
         * Promise.resolve(returnedValue).then(value => {
         *  // `value` is this value
         * })
         * @type {*|undefined}
         */
        this.value = value;
    }
}