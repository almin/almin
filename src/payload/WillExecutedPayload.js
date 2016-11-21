// LICENSE : MIT
"use strict";
import Payload from "./Payload";
export default class WillExecutedPayload extends Payload {
    /**
     * @return {string}
     */
    static get Type() {
        return "ALMIN__WILL_EXECUTED_EACH_USECASE__";
    }

    /**
     * @param {*[]} args
     */
    constructor({ args }) {
        super({ type: WillExecutedPayload.Type });
        this.args = args;
    }
}