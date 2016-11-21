// LICENSE : MIT
"use strict";
import Payload from "./Payload";
/**
 * @extend {Payload}
 */
export default class ErrorPayload extends Payload {
    /**
     * @return {string}
     */
    static get Type() {
        return "ALMIN__ErrorPayload__";
    }

    constructor({ error }) {
        super({ type: ErrorPayload.Type });
        this.error = error;
    }
}