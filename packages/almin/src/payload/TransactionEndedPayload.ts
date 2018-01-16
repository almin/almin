"use strict";
import { Payload } from "./Payload";

/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "__ALMIN_ENF_OF_TRANSACTION__";

/**
 * TransactionEndedPayload is end of transaction
 */
export class TransactionEndedPayload implements Payload {
    type = TYPE;
    // transaction name
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

export function isTransactionEndedPayload(v: Payload): v is TransactionEndedPayload {
    return v.type === TYPE;
}
