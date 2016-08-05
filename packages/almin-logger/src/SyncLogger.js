// LICENSE : MIT
"use strict";
import AlminLogger from "./AlminLogger";
const EventEmitter = require("events");
// performance.now polyfill
import now from "./performance-now";
export default class SyncLogger extends EventEmitter {
    constructor({console, templates}) {
        super();
        this._logMap = {};
        this._releaseHandlers = [];
        this.logger = console;
        this.templates = templates;
    }

    /**
     * flush current log buffer
     */
    flushBuffer() {
        this._logBuffer.length = 0;
    }

    /**
     * start logging for {@link context}
     * @param {Context} context
     */
    startLogging(context) {
        const onWillExecuteEachUseCase = useCase => {
            const startTimeStamp = now();
            this.logger.groupCollapsed(`\u{1F516} ${useCase.name}`, startTimeStamp);
            this._logMap[useCase.name] = startTimeStamp;
            this.logger.log(`${useCase.name} will execute`);
        };
        const onDispatch = payload => {
            this.logger.info(`\u{1F525} Dispatch:${String(payload.type)}`, payload)
        };
        const onChange = (stores) => {
            stores.forEach(state => {
                this.logger.groupCollapsed(`\u{1F4BE} Store:${state.name} is Changed`);
                this.logger.info(state.getState());
                this.logger.groupEnd();
            });
        };
        const onDidExecuteEachUseCase = (useCase) => {
            const startTimeStamp = this._logMap[useCase.name];
            const takenTime = now() - startTimeStamp;
            this.logger.log(`${useCase.name} did executed`);
            this.logger.info("Take time(ms): " + takenTime);
            this.logger.groupEnd(useCase.name);
            this.emit(AlminLogger.Events.output);
        };
        const onErrorHandler = (error) => {
            this._logError(error);
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
        this.logger.log(chunk);
    }

    _logError(payload) {
        // if has useCase and group by useCase
        if (payload.useCase) {
            this.logger.error(
                payload.useCase.name,
                payload.error
            );
        } else {
            this.logger.error(payload.error);
        }
    }

    /**
     * release event handlers
     */
    release() {
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
    }
}