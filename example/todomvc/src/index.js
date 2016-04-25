'use strict';

import React from 'react';
import ReactDOM from "react-dom";
import TodoApp from './components/TodoApp.react';
import AppLocator from "./AppLocator";
// store
import AppStoreGroup from "./js/store/AppStoreGroup";
// context
import {Context}  from "almin";
import {Dispatcher} from "almin";
import AlminLogger from "almin-logger";
// instances
const dispatcher = new Dispatcher();
// context connect dispatch with stores
const appContext = new Context({
    dispatcher,
    store: AppStoreGroup.create()
});
// start logger
const logger = new AlminLogger();
logger.startLogging(appContext);
// Singleton
AppLocator.context = appContext;
// entry point
ReactDOM.render(<TodoApp appContext={appContext}/>, document.getElementById("todoapp"));