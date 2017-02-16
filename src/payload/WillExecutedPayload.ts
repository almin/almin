// LICENSE : MIT
"use strict";
import Payload from "./Payload";

export const TYPE = "ALMIN__WILL_EXECUTED_EACH_USECASE__";

export default class WillExecutedPayload extends Payload {

    static get Type(): typeof TYPE {
        return TYPE;
    }

    /**
     * a array for argument of the useCase
     */
    args: Array<any>;

    constructor({ args = [] }: { args?: Array<any>; }) {
        super({ type: TYPE });
        this.args = args;
    }
}