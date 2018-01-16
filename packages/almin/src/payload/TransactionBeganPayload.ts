"use strict";
import { Payload } from "./Payload";

/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "__ALMIN_BEGAN_OF_TRANSACTION__";

/**
 * TransactionBeganPayload is begin of transaction
 */
export class TransactionBeganPayload implements Payload {
    type = TYPE;
    // transaction name
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

export function isTransactionBeganPayload(v: Payload): v is TransactionBeganPayload {
    return v.type === TYPE;
}
