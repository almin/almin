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

    constructor({ value }) {
        super({ type: DidExecutedPayload.Type });
        this.value = value;
    }
}