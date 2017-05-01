import { Payload } from "./Payload";
/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export declare const TYPE = "ALMIN__WILL_EXECUTED_EACH_USECASE__";
export declare class WillExecutedPayload extends Payload {
    /**
     * a array for argument of the useCase
     */
    args: Array<any>;
    constructor({args}: {
        args?: Array<any>;
    });
}
export declare function isWillExecutedPayload(v: Payload): v is WillExecutedPayload;
