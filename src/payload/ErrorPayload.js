// LICENSE : MIT
"use strict";
import Payload from "./Payload";
/**
 * This payload is executed
 */
export default class ErrorPayload extends Payload {
    /**
     * @return {string}
     */
    static get Type() {
        return "ALMIN__ErrorPayload__";
    }

    /**
     * @param {Error} error
     */
    constructor({ error }) {
        super({ type: ErrorPayload.Type });
        /**
         * the `error` in the UseCase
         * @type {Error}
         */
        this.error = error;
    }
}