// LICENSE : MIT
"use strict";
import Payload from "./Payload";

export const TYPE = "ALMIN__ErrorPayload__";

/**
 * This payload is executed
 */
export default class ErrorPayload extends Payload {

    static get Type(): typeof TYPE {
        return TYPE;
    }

    /**
     * the `error` in the UseCase
     */
    error: Error | any;

    constructor({ error }: { error?: Error | any; }) {
        super({ type: TYPE });
        this.error = error;
    }
}