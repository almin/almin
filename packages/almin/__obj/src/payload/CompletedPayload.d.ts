import { Payload } from "./Payload";
/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export declare const TYPE = "ALMIN__COMPLETED_EACH_USECASE__";
export declare class CompletedPayload extends Payload {
    /**
     * the value is returned by the useCase
     * Difference of DidExecutedPayload, the value always is resolved value.
     * Promise.resolve(returnedValue).then(value => {
     *  // `value` is this value
     * })
     */
    value: any | undefined;
    constructor({value}: {
        value?: any;
    });
}
export declare function isCompletedPayload(v: Payload): v is CompletedPayload;
