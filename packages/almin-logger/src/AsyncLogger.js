// LICENSE : MIT
"use strict";
import AlminLogger from "./AlminLogger";
const EventEmitter = require("events");
// performance.now polyfill
import now from "./performance-now";
export default class AsyncLogger extends EventEmitter {
    constructor({console}) {
        super();
        this._logBuffer = [];
        this._logMap = {};
        this._releaseHandlers = [];
        this.logger = console;
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
         * @param {*[]} args
         */
        const onWillExecuteEachUseCase = (useCase, args) => {
            this._logMap[useCase.name] = now();
            this.addLog(`${useCase.name} will execute: ${args}`)
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
            this.addLog(`${useCase.name} did executed`);
            this.addLog("Taken time(ms): " + takenTime);
            this._outputBuffer(`\u{1F516} ${useCase.name}`);
            this.flushBuffer();
        };
        // release handler
        this._releaseHandlers = [
            context.onChange(onChange),
            context.onDispatch(onDispatch),
            context.onWillExecuteEachUseCase(onWillExecuteEachUseCase),
            context.onDidExecuteEachUseCase(onDidExecuteEachUseCase),
            context.onErrorDispatch(onErrorHandler)
        ];
    }

    /**
     * add log to logger
     * @param {*} chunk
     */
    addLog(chunk) {
        this._logBuffer.push(chunk)
    }

    /**
     * flush current log buffer
     */
    flushBuffer() {
        this._logBuffer.length = 0;
    }


    /**
     * release event handlers
     */
    release() {
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
    }

    /**
     * show current buffer using logger.
     * @param {string} logTitle
     * @private
     */
    _outputBuffer(logTitle) {
        const output = (log) => {
            if (log instanceof Error) {
                this.logger.error(log);
            } else {
                this.logger.info(log);
            }
        };
        this.logger.groupCollapsed(logTitle);
        // if executing multiple UseCase at once, show warning
        const currentExecuteUseCases = this._logBuffer.filter(logBuffer=> {
            return typeof logBuffer === "string" && logBuffer.indexOf("will execute") !== -1;
        });
        if (currentExecuteUseCases.length > 1) {
            const useCaseNames = currentExecuteUseCases.map(name => {
                return name.replace(" will execute", "");
            });
            this.logger.warn(`Warning: Executing multiple UseCase at once`, useCaseNames);
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
     * @param {DispatcherPayload} payload
     * @private
     */
    _logError(payload) {
        // if has useCase and group by useCase
        if (payload.useCase) {
            this.addLog([
                payload.useCase.name,
                payload.error
            ]);
        } else {
            this.addLog(payload.error);
        }
    }

    /**
     * @param {DispatcherPayload} payload
     * @private
     */
    _logDispatch(payload) {
        // http://emojipedia.org/fire/
        this.addLog([
            `\u{1F525} Dispatch:${String(payload.type)}`,
            payload
        ]);
    }

    /**
     * @param {Store[]} stores
     * @private
     */
    _logOnChange(stores) {
        stores.forEach(store => {
            // http://emojipedia.org/floppy-disk/
            this.addLog([
                `\u{1F4BE} Store:${store.name} is Changed`,
                store.getState()
            ]);
        })
    }

}