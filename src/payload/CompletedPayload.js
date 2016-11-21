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

    constructor({ value }) {
        super({ type: CompletedPayload.Type });
        this.value = value;
    }
}