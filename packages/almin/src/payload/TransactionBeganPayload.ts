"use strict";
import { Payload } from "./Payload";

/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "ALMIN_BEGAN_OF_TRANSACTION__";

/**
 * TransactionBeganPayload is begin of transaction
 */
export class TransactionBeganPayload extends Payload {
    type: typeof TYPE;
    // transaction name
    name: string;

    constructor(name: string) {
        super({ type: TYPE });
        this.name = name;
    }
}

export function isTransactionBeganPayload(v: Payload): v is TransactionBeganPayload {
    return v.type === TYPE;
}
