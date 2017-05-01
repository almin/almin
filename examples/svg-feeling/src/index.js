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
import AlminLogger from "almin-logger";
// instances
const dispatcher = new Dispatcher();
const appStoreGroup = AppStoreGroup.create();
// context connect dispatch with stores
const appContext = new Context({
    dispatcher,
    store: appStoreGroup
});
if (process.env.NODE_ENV === "development") {
    window.Perf = require("react-addons-perf");
    // start logger
    const logger = new AlminLogger();
    logger.startLogging(appContext);
}
// Singleton
AppContextLocator.context = appContext;
// entry point
ReactDOM.render(<App appContext={appContext}/>, document.getElementById("js-app"));
