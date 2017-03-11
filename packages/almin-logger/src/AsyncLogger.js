// LICENSE : MIT
"use strict";
import AlminLogger from "./AlminLogger";
import LogGroup from "./log/LogGroup";
import LogChunk from "./log/LogChunk";
import PrintLogger from "./log/PrintLogger";
const EventEmitter = require("events");
const Map = require("map-like");
/**
 * Pattern
 *
 * AUseCase will
 * AUseCase did
 * AUseCase complete => output
 *
 * --------
 *
 * AUseCase will
 *  CUseCase will
 *  CUseCase did
 * AUseCase did
 * CUseCase Complete
 * AUseCase Complete
 *
 */
export default class AsyncLogger extends EventEmitter {
    /**
     * @param {Object} console
     */
    constructor({console}) {
        super();
        /**
         * Will show log buffer
         * @type {MapLike[]}
         * @private
         */
        this._currentLogBuffer = [];
        /**
         * @type {MapLike}
         */
        this._logMap = new Map();
        this._releaseHandlers = [];
        /**
         * @type {Console|Object|*}
         */
        this.logger = console;
        this.printLogger = new PrintLogger(this.logger);
    }

    /**
     * start logging for {@link context}
     * @param {Context} context
     */
    startLogging(context) {
        /**
         * @param {WillExecutedPayload} payload
         * @param {DispatcherPayloadMeta} meta
         */
        const onWillExecuteEachUseCase = (payload, meta) => {
            const useCase = meta.useCase;
            const parentUseCase = meta.parentUseCase !== useCase ? meta.parentUseCase : null;
            const parentSuffix = parentUseCase ? ` <- ${parentUseCase.name}` : "";
            const title = `${useCase.name}${parentSuffix}`;
            const logGroup = new LogGroup({title, useCaseName: useCase.name});
            const args = payload.args.length && payload.args.length > 0 ? payload.args : undefined;
            const log = [`${useCase.name} execute:`].concat(args);
            logGroup.addChunk(new LogChunk({
                useCase,
                payload,
                log,
                timeStamp: meta.timeStamp
            }));
            if (parentUseCase) {
                const parentLogMap = this._logMap.get(parentUseCase);
                parentLogMap.addGroup(logGroup);
            }
            this._logMap.set(useCase, logGroup);
            if (!parentUseCase) {
                // if logGroup is of root
                this._currentLogBuffer.push(logGroup);
            }
        };
        /**
         *
         * @param {Payload} payload
         * @param {DispatcherPayloadMeta} meta
         */
        const onDispatch = (payload, meta) => {
            const useCase = meta.useCase;
            if (!useCase) {
                this.addLog([
                    `\u{1F525} Dispatch:${String(payload.type)}`, payload
                ]);
                return;
            }
            const logGroup = this._logMap.get(useCase);
            // http://emojipedia.org/fire/
            logGroup.addChunk(new LogChunk({
                useCase,
                payload,
                log: [`${useCase.name} dispatch:${String(payload.type)}`, payload],
                timeStamp: meta.timeStamp
            }));
        };
        const onChangeStores = (changeStores) => {
            // one, or more stores
            const stores = [].concat(changeStores);
            const useCases = this._logMap.keys();
            const workingUseCaseNames = useCases.map(useCase => {
                return useCase.name;
            });
            // if Store#emitChange is called by async, workingUseCaseNames.length is 0.
            const existWorkingUseCase = workingUseCaseNames.length !== 0;
            if (existWorkingUseCase) {
                // It support Almin's QueuedStoreGroup implementation
                stores.forEach(store => {
                    this.addLog([
                        `\u{1F4BE} Store:${store.name}`,
                        store.getState()
                    ]);
                    if (workingUseCaseNames.length >= 1) {
                        this.addLog(`\u{2139}\u{FE0F} Currently executing UseCases: ${workingUseCaseNames.join(", ")}`);
                    }
                });
            } else {
                // It support Almin's StoreGroup implementation.
                // StoreGroup emit change after UseCase is completed
                const storeLogGroup = new LogGroup({
                    title: `Store is changed`
                });
                const timeStamp = Date.now();
                stores.forEach(store => {
                    storeLogGroup.addChunk(new LogChunk({
                        log: [`\u{1F4BE} Store:${store.name}`, store.getState()],
                        timeStamp
                    }))
                });
                this.printLogger.printLogGroup(storeLogGroup);
            }
        };
        /**
         * @param {ErrorPayload} payload
         * @param {DispatcherPayloadMeta} meta
         */
        const onErrorHandler = (payload, meta) => {
            // if has useCase and group by useCase
            const error = payload.error || "Something wrong";
            const useCase = meta.useCase;
            const logGroup = this._logMap.get(useCase);
            logGroup.addChunk(new LogChunk({
                log: [
                    `${useCase.name} throw Error:`,
                    error
                ],
                payload,
                useCase,
                timeStamp: meta.timeStamp
            }));
        };
        /**
         * @param {DidExecutedPayload} payload
         * @param {DispatcherPayloadMeta} meta
         */
        const onDidExecuteEachUseCase = (payload, meta) => {
            const useCase = meta.useCase;
            const resultValue = meta.value;
            const logGroup = this._logMap.get(useCase);
            logGroup.addChunk(new LogChunk({
                useCase,
                payload,
                log: [`${useCase.name} did executed:`, resultValue],
                timeStamp: meta.timeStamp
            }));
        };
        /**
         * @param {CompletedPayload} payload
         * @param {DispatcherPayloadMeta} meta
         */
        const onCompleteUseCase = (payload, meta) => {
            const useCase = meta.useCase;
            const resultValue = meta.value;
            const logGroup = this._logMap.get(useCase);
            logGroup.addChunk(new LogChunk({
                useCase,
                payload,
                log: [`${useCase.name} is completed:`, resultValue],
                timeStamp: meta.timeStamp
            }));
            const index = this._currentLogBuffer.indexOf(logGroup);
            if (index !== -1) {
                this._currentLogBuffer.splice(index, 1);
                this.printLogger.printLogGroup(logGroup);
                this.emit(AlminLogger.Events.output, logGroup);
            }
            this._logMap.delete(useCase);
        };
        // release handler
        this._releaseHandlers = [
            context.onChange(onChangeStores),
            context.onDispatch(onDispatch),
            context.onWillExecuteEachUseCase(onWillExecuteEachUseCase),
            context.onDidExecuteEachUseCase(onDidExecuteEachUseCase),
            context.onCompleteEachUseCase(onCompleteUseCase),
            context.onErrorDispatch(onErrorHandler)
        ];
    }

    /**
     * add log to logger
     * @param {*} log
     */
    addLog(log) {
        const useCases = this._logMap.keys();
        useCases.forEach(useCase => {
            const logGroup = this._logMap.get(useCase);
            logGroup.addChunk(new LogChunk({
                log: log,
                timeStamp: Date.now()
            }));
        });
    }

    /**
     * flush current log buffer
     */
    flushBuffer() {
        this._logMap.clear();
    }


    /**
     * release event handlers
     */
    release() {
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
        this._logMap.clear();
    }
}