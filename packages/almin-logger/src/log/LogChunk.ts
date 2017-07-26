// MIT © 2017 azu
"use strict";
import { DispatchedPayload, UseCaseLike } from "almin";

export interface LogChunkArgs {
    log?: any;
    payload?: DispatchedPayload;
    useCase?: UseCaseLike | null;
    timeStamp: number;
}

/**
 * Minimal Log Chunk object
 */
export class LogChunk {
    log?: any;
    payload?: DispatchedPayload;
    useCase?: UseCaseLike | null;
    timeStamp: number;

    /**
     * @param {*} [log]
     * @param {Object} [payload]
     * @param {UseCase} [useCase]
     * @param {number} timeStamp
     */
    constructor({ log, payload, useCase, timeStamp }: LogChunkArgs) {
        this.log = log;
        this.payload = payload;
        this.useCase = useCase;
        this.timeStamp = timeStamp;
    }
}
