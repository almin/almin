// LICENSE : MIT
"use strict";
import Payload from "./Payload";
export default class DidExecutedPayload extends Payload {
    /**
     * @return {string}
     */
    static get Type() {
        return "ALMIN__DID_EXECUTED_EACH_USECASE__";
    }

    /**
     * @param {*} [value]
     */
    constructor({ value }) {
        super({ type: DidExecutedPayload.Type });
        /**
         * the value is returned by the useCase
         * Maybe Promise or some value or undefined.
         * If you want to know unwrapped promise value, please see CompletedPayload.
         * @type {*|undefined}
         */
        this.value = value;
    }
}