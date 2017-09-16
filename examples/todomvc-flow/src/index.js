// @flow
"use strict";

import React from "react";
import ReactDOM from "react-dom";
import TodoApp from "./components/TodoApp.react";
import AppLocator from "./AppLocator";
// store
import AppStoreGroup from "./store/AppStoreGroup";
// use-case
import { CreateDomainUseCaseFactory } from "./usecase/CreateDomainUseCase";
// context
import { Context, Dispatcher } from "almin";
import { AlminLogger } from "almin-logger";
// instances
const dispatcher: Dispatcher = new Dispatcher();
// context connect dispatch with stores
const appContext: Context = new Context({
    dispatcher,
    store: AppStoreGroup.create()
});
// start logger
const logger = new AlminLogger();
logger.startLogging(appContext);
// Singleton
AppLocator.context = appContext;
// initialize domain
appContext
    .useCase(CreateDomainUseCaseFactory.create())
    .execute()
    .then(() => {
        // entry point
        ReactDOM.render(<TodoApp appContext={appContext} />, document.getElementById("todoapp"));
    });
