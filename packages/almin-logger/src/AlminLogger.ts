// LICENSE : MIT
"use strict";

import AsyncLogger from "./AsyncLogger";
import { EventEmitter } from "events";
import { Context } from "almin";

const AlminLoggerDefaultOptions = {
    // use `console` object for logging
    console: console
};

export interface AlminLoggerOptions {
    console?: any;
}

export class AlminLogger extends EventEmitter {
    private logger: AsyncLogger;

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
        const console = options.console || AlminLoggerDefaultOptions.console;
        const loggerOptions = {
            console
        };
        // default: Async logger
        this.logger = new AsyncLogger(loggerOptions);
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

    stopLogging() {
        this.logger.stopLogging();
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

// also export as default
export default AlminLogger;
