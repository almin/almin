// LICENSE : MIT
"use strict";
export default class ContextLogger {
    constructor() {
        this.logMap = {};
        this.releaseHandlers = [];
    }

    /**
     * @param {Context} context
     */
    startLogging(context) {
        this.logMap = {};
        this.releaseHandlers = [];
        const onWillExecuteEachUseCase = useCase => {
            const startTimeStamp = performance.now();
            console.groupCollapsed(useCase.name, startTimeStamp);
            this.logMap[useCase.name] = startTimeStamp;
            console.log(`${useCase.name} will execute`);
        };
        const onDispatch = payload => {
            this.logDispatch(payload);
        };
        const onChange = (stores) => {
            this.logOnChange(stores);
        };
        const onErrorHandler = (error) => {
            this.logError(error);
        };
        const onDidExecuteEachUseCase = useCase => {
            const startTimeStamp = this.logMap[useCase.name];
            const takenTime = performance.now() - startTimeStamp;
            console.log(`${useCase.name} did executed`);
            console.info("Take time(ms): " + takenTime);
            console.groupEnd(useCase.name);
        };
        // release handler
        this.releaseHandlers = [
            context._dispatcher.onWillExecuteEachUseCase(onWillExecuteEachUseCase),
            context._dispatcher.onDispatch(onDispatch),
            context.onChange(onChange),
            context._dispatcher.onDidExecuteEachUseCase(onDidExecuteEachUseCase),
            context._dispatcher.onError(onErrorHandler)
        ]
    }

    logError(payload) {
        console.error(payload.error);
        console.groupEnd(payload.useCase.name);
    }

    logDispatch(payload) {
        console.info(`Dispatch:${payload.type}`, payload);
    }

    /**
     * @param {Store[]} stores
     */
    logOnChange(stores) {
        stores.forEach(state => {
            console.groupCollapsed(`Store:${state.name} is Changed`);
            console.info(state.getState());
        })
    }
}