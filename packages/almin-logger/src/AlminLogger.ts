// LICENSE : MIT
"use strict";

import SyncLogger from "./SyncLogger";
import AsyncLogger from "./AsyncLogger";
import { EventEmitter } from "events";
import { Context } from "almin";

const DefaultOptions = {
    // output log asynchronously
    async: true,
    // use `console` object for logging
    console: console
};

export interface AlminLoggerOptions {
    console?: any;
    async?: boolean;
}

export default class AlminLogger extends EventEmitter {
    private isAsyncMode: boolean;
    private logger: AsyncLogger | SyncLogger;

    /**
     * Event constants values
     * @returns {{start: string, output: string, flush: string, release: string}}
     */
    static get Events() {
        return {
            output: "output"
        };
    }

    constructor(options: AlminLoggerOptions = {}) {
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
    startLogging(context: Context<any>) {
        this.logger.startLogging(context);
    }

    stopLogging(_context: Context<any>) {
        this.logger.release();
    }

    /**
     * add log to logger
     * @param {*} chunk
     */
    addLog(chunk: any) {
        this.logger.addLog(chunk);
    }

    /**
     * release event handlers
     */
    release() {
        this.logger.release();
    }
}
