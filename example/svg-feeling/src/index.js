// LICENSE : MIT
"use strict";
import React from "react";
import ReactDOM from "react-dom";
import App from "./component/container/App";
import AppContextLocator from "./AppContextLocator";
// store
import AppStoreGroup from "./js/store/AppStoreGroup";
// context
import {Context}  from "almin";
import {Dispatcher} from "almin";
import ContextLogger from "./js/util/ContextLogger";
// instances
const dispatcher = new Dispatcher();
const appStoreGroup = new AppStoreGroup();
// context connect dispatch with stores
const appContext = new Context({
    dispatcher,
    store: appStoreGroup
});
// LOG
const Perf = require('react-addons-perf');
window.Perf = Perf;
if (process.env.NODE_ENV === `development`) {
    const logMap = {};
    dispatcher.onWillExecuteEachUseCase(useCase => {
        const startTimeStamp = performance.now();
        console.groupCollapsed(useCase.name, startTimeStamp);
        logMap[useCase.name] = startTimeStamp;
        console.log(`${useCase.name} will execute`);
    });
    dispatcher.onDispatch(payload => {
        ContextLogger.logDispatch(payload);
    });
    appContext.onChange((stores) => {
        ContextLogger.logOnChange(stores);
    });
    dispatcher.onDidExecuteEachUseCase(useCase => {
        const startTimeStamp = logMap[useCase.name];
        const takenTime = performance.now() - startTimeStamp;
        console.log(`${useCase.name} did executed`);
        console.info("Take time(ms): " + takenTime);
        console.groupEnd(useCase.name);
    });
}
// Singleton
AppContextLocator.context = appContext;
// entry point
ReactDOM.render(<App appContext={appContext}/>, document.getElementById("js-app"));