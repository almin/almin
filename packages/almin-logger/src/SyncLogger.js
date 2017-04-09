// LICENSE : MIT
"use strict";
import AlminLogger from "./AlminLogger";
const EventEmitter = require("events");
// FIXME: Almin 0.12 support pull-based Store
// https://github.com/almin/almin/pull/154
// Some Store must to have prevState arguments.
// Call ths Store without argument, throw error
const tryGetState = (store) => {
    try {
        return store.getState();
    } catch (error) {
        return null;// not get
    }
};

export default class SyncLogger extends EventEmitter {
    constructor({ console }) {
        super();
        this._logMap = {};
        this._releaseHandlers = [];
        this.logger = console;
    }

    /**
     * flush current log buffer
     */
    flushBuffer() {
        this._logMap.clear();
    }

    /**
     * start logging for {@link context}
     * @param {Context} context
     */
    startLogging(context) {
        const onWillExecuteEachUseCase = (payload, meta) => {
            this.logger.groupCollapsed(`\u{1F516} ${meta.name}`, meta.timeStamp);
            this._logMap[meta.useCase.name] = meta.timeStamp;
            this.logger.log(`${meta.useCase.name} will execute`);
        };
        const onDispatch = payload => {
            this.logger.info(`\u{1F525} Dispatch:${String(payload.type)}`, payload)
        };
        const onChange = (stores) => {
            stores.forEach(store => {
                const state = tryGetState(store);
                this.logger.groupCollapsed(`\u{1F4BE} Store:${state.name} is Changed`);
                this.logger.info(state !== null ? state : store);
                this.logger.groupEnd();
            });
        };
        const onDidExecuteEachUseCase = (payload, meta) => {
            this.logger.log(`${meta.useCase.name} did executed`);
        };
        const onErrorHandler = (payload, meta) => {
            this._logError(payload, meta);
        };

        const onCompleteUseCase = (payload, meta) => {
            const useCase = meta.useCase;
            const startTimeStamp = this._logMap[useCase.name];
            const takenTime = meta.timeStamp - startTimeStamp;
            this.logger.log(`${useCase.name} is completed`);
            this.logger.info("Take time(ms): " + takenTime);
            this.logger.groupEnd(useCase.name);
            this.emit(AlminLogger.Events.output);
        };
        // release handler
        this._releaseHandlers = [
            context.onChange(onChange),
            context.onDispatch(onDispatch),
            context.onWillExecuteEachUseCase(onWillExecuteEachUseCase),
            context.onDidExecuteEachUseCase(onDidExecuteEachUseCase),
            context.onCompleteEachUseCase(onCompleteUseCase),
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

    _logError(payload, meta) {
        // if has useCase and group by useCase
        const error = payload.error || "something wrong";
        if (meta.useCase) {
            this.logger.error(
                meta.useCase.name,
                error
            );
        } else {
            this.logger.error(error);
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