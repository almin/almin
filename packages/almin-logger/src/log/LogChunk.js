// MIT © 2017 azu
"use strict";
/**
 * Minimal Log Chunk object
 */
export default class LogChunk {
    /**
     * @param {*} [log]
     * @param {Object} [payload]
     * @param {UseCase} [useCase]
     * @param {number} timeStamp
     */
    constructor({
        log,
        payload,
        useCase,
        timeStamp
    }) {
        this.log = log;
        this.payload = payload;
        this.useCase = useCase;
        this.timeStamp = timeStamp;
    }
}