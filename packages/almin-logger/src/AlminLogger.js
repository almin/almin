// LICENSE : MIT
"use strict";
const EventEmitter = require("events");
import SyncLogger from "./SyncLogger";
import AsyncLogger from "./AsyncLogger";
const DefaultOptions = {
    // output log asynchronously
    async: true,
    // use `console` object for logging
    console: console
};
export default class AlminLogger extends EventEmitter {
    /**
     * Event constants values
     * @returns {{start: string, output: string, flush: string, release: string}}
     */
    static get Events() {
        return {
            output: "output"
        };
    }

    constructor(options = {}) {
        super();
        // default logger is `console`
        const console = options.console || DefaultOptions.console;
        const isAsyncMode = options.async !== undefined ? options.async : DefaultOptions.async;
        const loggerOptions = {
            console
        };
        /**
         * @type {boolean} if current is async mode, return true
         */
        this.isAsyncMode = isAsyncMode;
        // default: Async logger
        this.logger = isAsyncMode ? new AsyncLogger(loggerOptions) : new SyncLogger(loggerOptions);
        this.logger.on(AlminLogger.Events.output, () => {
            this.emit(AlminLogger.Events.output);
        });
    }

    flushBuffer() {
        this.logger.flushBuffer();
    }

    /**
     * start logging for {@link context}
     * @param {Context} context
     */
    startLogging(context) {
        this.logger.startLogging(context);
    }

    /**
     * add log to logger
     * @param {*} chunk
     */
    addLog(chunk) {
        this.logger.addLog(chunk);
    }

    /**
     * release event handlers
     */
    release() {
        this.logger.release();
    }
}