import React from 'react';
import ReactDOM from 'react-dom';
import App from "./components/App";
import AppLocator from "./AppLocator";
import ContextLogger from "./utils/ContextLogger";
// store
import AppStore from "./stores/AppStore";
// context
import {Context}  from "almin";
import {Dispatcher} from "almin";
// instances
const dispatcher = new Dispatcher();
// context connect dispatch with stores
const appContext = new Context({
    dispatcher,
    store: AppStore.create()
});
const logger = new ContextLogger();
logger.startLogging(appContext);
// update global context
AppLocator.context = appContext;
ReactDOM.render(
    React.createElement(App, {
        appContext
    }),
    document.getElementById('flux-app')
);
