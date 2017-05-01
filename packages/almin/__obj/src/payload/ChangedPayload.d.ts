import { Payload } from "./Payload";
/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export declare const TYPE = "ALMIN__ChangedPayload__";
/**
 * ChangePayload is that represent something is changed.
 * Often, Store is changed.
 */
export declare class ChangedPayload extends Payload {
    constructor();
}
