// LICENSE : MIT
"use strict";
import { Payload } from "./Payload";
/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "__ALMIN_CHANGED_PAYLOAD__";

/**
 * ChangePayload is that represent something is changed.
 * Often, Store is changed.
 * @deprecated
 */
export class ChangedPayload implements Payload {
    type = TYPE;
    constructor() {
        console.warn("ChangedPayload will be removed.");
    }
}
