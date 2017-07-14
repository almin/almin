"use strict";
import { Payload } from "./Payload";

/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "ALMIN_ENF_OF_TRANSACTION__";

/**
 * EndTransactionPayload is end of transaction
 */
export class EndTransactionPayload extends Payload {
    // transaction name
    name: string;

    constructor(name: string) {
        super({ type: TYPE });
        this.name = name;
    }
}

export function isEndTransactionPayload(v: Payload): v is EndTransactionPayload {
    return v.type === TYPE;
}
