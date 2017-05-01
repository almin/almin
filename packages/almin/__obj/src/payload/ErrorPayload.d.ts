import { Payload } from "./Payload";
/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export declare const TYPE = "ALMIN__ErrorPayload__";
/**
 * This payload is executed
 */
export declare class ErrorPayload extends Payload {
    /**
     * the `error` in the UseCase
     */
    error: Error | any;
    constructor({error}: {
        error?: Error | any;
    });
}
export declare function isErrorPayload(v: Payload): v is ErrorPayload;
