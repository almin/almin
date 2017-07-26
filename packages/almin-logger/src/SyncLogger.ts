// LICENSE : MIT
"use strict";
import AlminLogger from "./AlminLogger";
import { EventEmitter } from "events";
import {
    AnyPayload,
    CompletedPayload,
    Context,
    DidExecutedPayload,
    DispatcherPayloadMeta,
    ErrorPayload,
    Payload,
    Store,
    WillExecutedPayload
} from "almin";
// FIXME: Almin 0.12 support pull-based Store
// https://github.com/almin/almin/pull/154
// Some Store must to have prevState arguments.
// Call ths Store without argument, throw error
const tryGetState = (store: Store) => {
    try {
        return store.getState();
    } catch (error) {
        return null; // not get
    }
};

export default class SyncLogger extends EventEmitter {
    _releaseHandlers: Array<() => void>;
    _logMap: {
        [extraProps: string]: any;
    };
    private logger: any;

    constructor({ console }: { console: any }) {
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
    startLogging(context: Context<any>) {
        const onWillExecuteEachUseCase = (_payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => {
            if (!meta.useCase) {
                return;
            }
            const useCaseName = meta.useCase.name;
            this.logger.groupCollapsed(`\u{1F516} ${useCaseName}`, meta.timeStamp);
            this._logMap[useCaseName] = meta.timeStamp;
            this.logger.log(`${useCaseName} will execute`);
        };
        const onDispatch = (payload: Payload | AnyPayload) => {
            this.logger.info(`\u{1F525} Dispatch:${String(payload.type)}`, payload);
        };
        const onChange = (stores: Store[]) => {
            stores.forEach(store => {
                const state = tryGetState(store);
                this.logger.groupCollapsed(`\u{1F4BE} Store:${state.name} is Changed`);
                this.logger.info(state !== null ? state : store);
                this.logger.groupEnd();
            });
        };
        const onDidExecuteEachUseCase = (_payload: DidExecutedPayload, meta: DispatcherPayloadMeta) => {
            const useCase = meta.useCase;
            if (!useCase) {
                return;
            }
            this.logger.log(`${useCase.name} did executed`);
        };
        const onErrorHandler = (payload: ErrorPayload, meta: DispatcherPayloadMeta) => {
            this._logError(payload, meta);
        };

        const onCompleteUseCase = (_payload: CompletedPayload, meta: DispatcherPayloadMeta) => {
            const useCase = meta.useCase;
            if (!useCase) {
                return;
            }
            const startTimeStamp = this._logMap[useCase.name];
            const takenTime = meta.timeStamp - startTimeStamp;
            this.logger.log(`${useCase.name} is completed`);
            this.logger.info(`Take time(ms): ${takenTime}`);
            this.logger.groupEnd(useCase.name);
            this.emit(AlminLogger.Events.output);
        };
        // release handler
        this._releaseHandlers = [
            context.onChange(onChange),
            context.events.onDispatch(onDispatch),
            context.events.onWillExecuteEachUseCase(onWillExecuteEachUseCase),
            context.events.onDidExecuteEachUseCase(onDidExecuteEachUseCase),
            context.events.onCompleteEachUseCase(onCompleteUseCase),
            context.events.onErrorDispatch(onErrorHandler)
        ];
    }

    /**
     * add log to logger
     * @param {*} chunk
     */
    addLog(chunk: any) {
        this.logger.log(chunk);
    }

    _logError(payload: any, meta: DispatcherPayloadMeta) {
        // if has useCase and group by useCase
        const error = payload.error || "something wrong";
        if (meta.useCase) {
            this.logger.error(meta.useCase.name, error);
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
