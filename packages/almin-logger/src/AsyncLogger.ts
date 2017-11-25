// LICENSE : MIT
"use strict";
import AlminLogger from "./AlminLogger";
import { LogGroup } from "./log/LogGroup";
import { LogChunk } from "./log/LogChunk";
import { PrintLogger } from "./log/PrintLogger";
import { EventEmitter } from "events";
import {
    CompletedPayload,
    Context,
    DidExecutedPayload,
    DispatcherPayloadMeta,
    ErrorPayload,
    Payload,
    Store,
    StoreChangedPayload,
    StoreLike,
    TransactionBeganPayload,
    TransactionEndedPayload,
    UseCase,
    UseCaseLike,
    WillExecutedPayload,
    WillNotExecutedPayload
} from "almin";
import { MapLike } from "map-like";
// FIXME: Almin 0.12 support pull-based Store
// https://github.com/almin/almin/pull/154
// Some Store must to have prevState arguments.
// Call ths Store without argument, throw error
const tryGetState = (store: StoreLike) => {
    try {
        return store.getState();
    } catch (error) {
        return null; // not get
    }
};
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
 * -----
 *
 * AUseCase will not execute
 *
 */
export default class AsyncLogger extends EventEmitter {
    private useCaseLogGroupMap: MapLike<UseCaseLike, LogGroup>;
    private logger: any;
    private printLogger: PrintLogger;
    private currentLogBuffer: LogGroup[];
    private _releaseHandlers: Array<() => void>;
    private _transactionMap: MapLike<string, LogGroup>;

    /**
     * @param {Object} console
     */
    constructor({ console }: { console: any }) {
        super();
        /**
         * Will show log buffer
         * @type {MapLike[]}
         * @private
         */
        this.currentLogBuffer = [];
        /**
         * @type {MapLike}
         */
        this.useCaseLogGroupMap = new MapLike<UseCaseLike, LogGroup>();
        /**
         * @type {MapLike}
         */
        this._transactionMap = new MapLike<string, LogGroup>();
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
    startLogging(context: Context<any>) {
        /**
         *
         * @param meta
         * @returns {LogGroup|undefined}
         */
        const getTransactionLogGroup = (meta: DispatcherPayloadMeta) => {
            // if it is transaction, add this logGroup as child of transaction
            const transactionId = meta.transaction && meta.transaction.id;
            if (transactionId) {
                return this._transactionMap.get(transactionId);
            }
            return;
        };

        /**
         *
         * @param {LogGroup} logGroup
         */
        const outputLogging = (logGroup: LogGroup) => {
            const index = this.currentLogBuffer.indexOf(logGroup);
            if (index !== -1) {
                this.currentLogBuffer.splice(index, 1);
                this.printLogger.printLogGroup(logGroup);
                this.emit(AlminLogger.Events.output, logGroup);
            }
        };
        /**
         * Start Transaction and create new LogGroup
         */
        const onBeginTransaction = (_payload: TransactionBeganPayload, meta: DispatcherPayloadMeta) => {
            if (!meta.transaction) {
                console.warn("meta.transaction is missing");
                return;
            }
            const logGroup = new LogGroup({ title: meta.transaction.name, isTransaction: true });
            this._transactionMap.set(meta.transaction.id, logGroup);
            // the logGroup is root
            this.currentLogBuffer.push(logGroup);
        };

        /**
         * End Transaction and output log if needed
         */
        const onEndTransaction = (_payload: TransactionEndedPayload, meta: DispatcherPayloadMeta) => {
            if (!meta.transaction) {
                console.warn("meta.transaction is missing");
                return;
            }
            const logGroup = getTransactionLogGroup(meta);
            if (logGroup) {
                outputLogging(logGroup);
            }
            this._transactionMap.delete(meta.transaction.id);
        };
        const onWillNptExecuteEachUseCase = (payload: WillNotExecutedPayload, meta: DispatcherPayloadMeta) => {
            const useCase = meta.useCase;
            if (!useCase) {
                return;
            }
            const parentUseCase =
                meta.parentUseCase !== useCase && meta.parentUseCase instanceof UseCase ? meta.parentUseCase : null;
            const parentSuffix = parentUseCase ? ` <- ${parentUseCase.name}` : "";
            const useCaseName = useCase ? useCase.name : "<no-name>";
            const title = `${useCaseName}${parentSuffix}`;
            const args = payload.args.length && payload.args.length > 0 ? payload.args : [undefined];
            const log = [`${useCaseName} not execute:`].concat(args);
            const useCases = this.useCaseLogGroupMap.keys();
            const existWorkingUseCase = useCases.length !== 0;
            if (existWorkingUseCase) {
                const logGroup = this.useCaseLogGroupMap.get(useCase);
                if (!logGroup) {
                    return;
                }
                logGroup.addChunk(
                    new LogChunk({
                        log: [log],
                        payload,
                        useCase: meta.useCase,
                        timeStamp: meta.timeStamp
                    })
                );
            } else {
                // immediately dump log
                const logGroup = new LogGroup({ title, useCaseName: useCaseName });
                this.printLogger.printLogGroup(logGroup);
            }
        };
        /**
         * @param {WillExecutedPayload} payload
         * @param {DispatcherPayloadMeta} meta
         */
        const onWillExecuteEachUseCase = (payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => {
            const useCase = meta.useCase;
            if (!useCase) {
                return;
            }
            const parentUseCase =
                meta.parentUseCase !== useCase && meta.parentUseCase instanceof UseCase ? meta.parentUseCase : null;
            const parentSuffix = parentUseCase ? ` <- ${parentUseCase.name}` : "";
            const useCaseName = useCase ? useCase.name : "<no-name>";
            const title = `${useCaseName}${parentSuffix}`;
            const logGroup = new LogGroup({ title, useCaseName: useCaseName });
            const args = payload.args.length && payload.args.length > 0 ? payload.args : [undefined];
            const log = [`${useCaseName} execute:`].concat(args);
            logGroup.addChunk(
                new LogChunk({
                    useCase,
                    payload,
                    log,
                    timeStamp: meta.timeStamp
                })
            );
            if (parentUseCase) {
                const parentLogMap = this.useCaseLogGroupMap.get(parentUseCase);
                if (parentLogMap) {
                    parentLogMap.addGroup(logGroup);
                }
            }
            this.useCaseLogGroupMap.set(useCase, logGroup);
            // if it is transaction, add this logGroup as child of transaction
            const transactionLogGroup = getTransactionLogGroup(meta);
            if (transactionLogGroup) {
                transactionLogGroup.addGroup(logGroup);
            } else if (!parentUseCase) {
                // if logGroup is of root
                this.currentLogBuffer.push(logGroup);
            }
        };
        /**
         *
         * @param {Payload} payload
         * @param {DispatcherPayloadMeta} meta
         */
        const onDispatch = (payload: Payload, meta: DispatcherPayloadMeta) => {
            const useCase = meta.useCase;
            if (!useCase) {
                this.addLog([`\u{1F525} Dispatch:${String(payload.type)}`, payload]);
                return;
            }
            const logGroup = this.useCaseLogGroupMap.get(useCase);
            if (!logGroup) {
                console.warn("Warning(almin-logger): logGroup is not found. please report as issue.", payload, meta);
                return;
            }
            // http://emojipedia.org/fire/
            logGroup.addChunk(
                new LogChunk({
                    useCase,
                    payload,
                    log: [`${useCase.name} dispatch:${String(payload.type)}`, payload],
                    timeStamp: meta.timeStamp
                })
            );
        };
        /**
         * @param {StoreChangedPayload} payload
         * @param {DispatcherPayloadMeta} meta
         */
        const onChangeStore = (payload: StoreChangedPayload, meta: DispatcherPayloadMeta) => {
            const store = payload.store as Store;
            const storeName = store.name ? store.name : "no-name";
            // one, or more stores
            const useCases = this.useCaseLogGroupMap.keys();
            const workingUseCaseNames = useCases.map(useCase => {
                return useCase.name;
            });
            const existWorkingUseCase = workingUseCaseNames.length !== 0;
            if (existWorkingUseCase) {
                const state = tryGetState(store);
                if (meta.useCase) {
                    const logGroup = this.useCaseLogGroupMap.get(meta.useCase);
                    if (!logGroup) {
                        return;
                    }
                    logGroup.addChunk(
                        new LogChunk({
                            log: [`\u{1F4BE} Store:${storeName}`, state !== null ? state : store],
                            payload,
                            useCase: meta.useCase,
                            timeStamp: meta.timeStamp
                        })
                    );
                } else {
                    // add log to all UseCase
                    this.addLog([`\u{1F4BE} Store:${storeName}`, state !== null ? state : store]);
                    if (workingUseCaseNames.length >= 2) {
                        this.addLog(`\u{2139}\u{FE0F} Currently executing UseCases: ${workingUseCaseNames.join(", ")}`);
                    }
                }
            } else {
                // Async update of StoreGroup
                const transactionLogGroup = getTransactionLogGroup(meta);
                if (transactionLogGroup) {
                    const state = tryGetState(store);
                    transactionLogGroup.addChunk(
                        new LogChunk({
                            log: [`\u{1F4BE} Store:${storeName}`, state !== null ? state : store],
                            timeStamp: meta.timeStamp
                        })
                    );
                } else {
                    // If isolated store update, immediate dump this
                    const storeLogGroup = new LogGroup({
                        title: `Store(${storeName}) is changed`
                    });
                    const state = tryGetState(store);
                    storeLogGroup.addChunk(
                        new LogChunk({
                            log: [`\u{1F4BE} Store:${storeName}`, state !== null ? state : store],
                            timeStamp: meta.timeStamp
                        })
                    );
                    this.printLogger.printLogGroup(storeLogGroup);
                }
            }
        };
        /**
         * @param {ErrorPayload} payload
         * @param {DispatcherPayloadMeta} meta
         */
        const onErrorHandler = (payload: ErrorPayload, meta: DispatcherPayloadMeta) => {
            // if has useCase and group by useCase
            const error = payload.error || "Something wrong";
            const useCase = meta.useCase;
            if (!useCase) {
                this.addLog(error);
                return;
            }
            const logGroup = this.useCaseLogGroupMap.get(useCase);
            if (!logGroup) {
                console.warn("Warning(almin-logger): logGroup is not found. please report as issue.", payload, meta);
                return;
            }
            logGroup.addChunk(
                new LogChunk({
                    log: [`${useCase.name} throw Error:`, error],
                    payload,
                    useCase,
                    timeStamp: meta.timeStamp
                })
            );
        };
        /**
         * @param {DidExecutedPayload} payload
         * @param {DispatcherPayloadMeta} meta
         */
        const onDidExecuteEachUseCase = (payload: DidExecutedPayload, meta: DispatcherPayloadMeta) => {
            const useCase = meta.useCase;
            if (!useCase) {
                return;
            }
            const resultValue = payload.value;
            const logGroup = this.useCaseLogGroupMap.get(useCase);
            if (!logGroup) {
                console.warn("Warning(almin-logger): logGroup is not found. please report as issue.", payload, meta);
                return;
            }
            logGroup.addChunk(
                new LogChunk({
                    useCase,
                    payload,
                    log: [`${useCase.name} did executed:`, resultValue],
                    timeStamp: meta.timeStamp
                })
            );
        };
        /**
         * @param {CompletedPayload} payload
         * @param {DispatcherPayloadMeta} meta
         */
        const onCompleteUseCase = (payload: CompletedPayload, meta: DispatcherPayloadMeta) => {
            const useCase = meta.useCase;
            if (!useCase) {
                return;
            }
            const resultValue = payload.value;
            const logGroup = this.useCaseLogGroupMap.get(useCase);
            if (!logGroup) {
                console.warn("Warning(almin-logger): logGroup is not found. please report as issue.", payload, meta);
                return;
            }
            logGroup.addChunk(
                new LogChunk({
                    useCase,
                    payload,
                    log: [`${useCase.name} is completed:`, resultValue],
                    timeStamp: meta.timeStamp
                })
            );
            const transactionLogGroup = getTransactionLogGroup(meta);
            if (!transactionLogGroup) {
                outputLogging(logGroup);
            }
            this.useCaseLogGroupMap.delete(useCase);
        };

        // release handler
        this._releaseHandlers = [
            context.events.onBeginTransaction(onBeginTransaction),
            context.events.onEndTransaction(onEndTransaction),
            context.events.onChangeStore(onChangeStore),
            context.events.onDispatch(onDispatch),
            context.events.onWillExecuteEachUseCase(onWillExecuteEachUseCase),
            context.events.onDidExecuteEachUseCase(onDidExecuteEachUseCase),
            context.events.onCompleteEachUseCase(onCompleteUseCase),
            context.events.onErrorDispatch(onErrorHandler)
        ];
        if (context.events.onWillNotExecuteEachUseCase) {
            this._releaseHandlers.push(context.events.onWillNotExecuteEachUseCase(onWillNptExecuteEachUseCase));
        }
    }

    stopLogging() {
        this.release();
    }

    /**
     * add log to logger
     * @param {*} log
     */
    addLog(log: any) {
        const useCases = this.useCaseLogGroupMap.keys();
        useCases.forEach(useCase => {
            const logGroup = this.useCaseLogGroupMap.get(useCase);
            if (!logGroup) {
                return;
            }
            logGroup.addChunk(
                new LogChunk({
                    log,
                    timeStamp: Date.now()
                })
            );
        });
    }

    /**
     * flush current log buffer
     */
    flushBuffer() {
        this.currentLogBuffer.length = 0;
        this.useCaseLogGroupMap.clear();
        this._transactionMap.clear();
    }

    /**
     * release event handlers
     */
    release() {
        this.flushBuffer();
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
    }
}
