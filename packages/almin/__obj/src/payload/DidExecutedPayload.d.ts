import { Payload } from "./Payload";
/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export declare const TYPE = "ALMIN__DID_EXECUTED_EACH_USECASE__";
export declare class DidExecutedPayload extends Payload {
    /**
     * the value is returned by the useCase
     * Maybe Promise or some value or undefined.
     * If you want to know unwrapped promise value, please see CompletedPayload.
     */
    value: any | undefined;
    constructor({value}: {
        value?: any;
    });
}
export declare function isDidExecutedPayload(v: Payload): v is DidExecutedPayload;
