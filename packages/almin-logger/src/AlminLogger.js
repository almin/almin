// LICENSE : MIT
"use strict";
const EventEmitter = require("events");
import now from "./performance-now";
const DefaultOptions = {
    console: console
};
export default class AlminLogger extends EventEmitter {
    /**
     * Event constants values
     * @returns {{start: string, output: string, flush: string, release: string}}
     */
    static get Events() {
        return {
            start: "start",
            output: "output",
            flush: "flush",
            release: "release"
        };
    }

    constructor({console} = {}) {
        super();
        this._logBuffer = [];
        this._logMap = {};
        this._releaseHandlers = [];
        // default logger is `console`
        this.logger = console || DefaultOptions.console;
    }

    /**
     * show current buffer using logger.
     * @param {string} logTitle
     */
    outputBuffer(logTitle) {
        const output = (log) => {
            if (log instanceof Error) {
                this.logger.error(error);
            } else {
                this.logger.info(log);
            }
        };
        this.logger.groupCollapsed(logTitle);
        // if executing multiple UseCase at once, show warning
        const currentExecuteUseCases = this._logBuffer.filter(logBuffer=> {
            return logBuffer.indexOf("will execute") !== -1;
        });
        if (currentExecuteUseCases.length > 1) {
            this.logger.warn("Warning: Executing multiple UseCase at once", currentExecuteUseCases.map(name => {
                return name.replace(" will execute", "");
            }))
        }
        this._logBuffer.forEach(logBuffer => {
            if (Array.isArray(logBuffer)) {
                const title = logBuffer.shift();
                this.logger.groupCollapsed(title);
                logBuffer.forEach(output);
                this.logger.groupEnd();
            } else {
                output(logBuffer);
            }
        });
        this.logger.groupEnd();
        this.emit(AlminLogger.Events.output);
    }

    /**
     * flush current log buffer
     */
    flushBuffer() {
        this._logBuffer.length = 0;
        this.emit(AlminLogger.Events.flush);
    }

    /**
     * start logging for {@link context}
     * @param {Context} context
     */
    startLogging(context) {
        this._logMap = {};
        this._logBuffer = [];
        this._releaseHandlers = [];
        /**
         * @param {UseCase} useCase
         */
        const onWillExecuteEachUseCase = useCase => {
            this._logMap[useCase.name] = now();
            this._logBuffer.push(`${useCase.name} will execute`)
        };
        const onDispatch = payload => {
            this._logDispatch(payload);
        };
        const onChange = (stores) => {
            this._logOnChange(stores);
        };
        const onErrorHandler = (error) => {
            this._logError(error);
        };
        const onDidExecuteEachUseCase = useCase => {
            const timeStamp = this._logMap[useCase.name];
            const takenTime = now() - timeStamp;
            this._logBuffer.push(`${useCase.name} did executed`);
            this._logBuffer.push("Taken time(ms): " + takenTime);
            this.outputBuffer(`\ud83d\udcbe ${useCase.name}`);
            this.flushBuffer();
        };
        // release handler
        this._releaseHandlers = [
            context.onChange(onChange),
            context.onWillExecuteEachUseCase(onWillExecuteEachUseCase),
            context.onDidExecuteEachUseCase(onDidExecuteEachUseCase),
            context.onErrorDispatch(onErrorHandler)
        ];
        this.emit(AlminLogger.Events.start);

    }

    _logError(payload) {
        // if has useCase and group by useCase
        if (payload.useCase) {
            this._logBuffer.push([
                payload.useCase.name,
                payload.error
            ]);
        } else {
            this._logBuffer.push(payload.error);
        }
    }

    _logDispatch(payload) {
        this._logBuffer.push([
            `Dispatch:${payload.type}`,
            payload
        ]);
    }

    /**
     * @param {Store[]} stores
     */
    _logOnChange(stores) {
        stores.forEach(store => {
            this._logBuffer.push([
                `Store:${store.name} is Changed`,
                store.getState()
            ]);
        })
    }

    /**
     * release event handlers
     */
    release() {
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
        this.emit(AlminLogger.Events.release);
    }
}