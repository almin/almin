"use strict";
import { Payload } from "./Payload";

/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "ALMIN_BEGIN_OF_TRANSACTION__";

/**
 * BeginTransactionPayload is begin of transaction
 */
export class BeginTransactionPayload extends Payload {
    // transaction name
    name: string;

    constructor(name: string) {
        super({ type: TYPE });
        this.name = name;
    }
}

export function isBeginTransactionPayload(v: Payload): v is BeginTransactionPayload {
    return v.type === TYPE;
}
