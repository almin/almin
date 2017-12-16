"use strict";
import React from "react";
import ReactDOM from "react-dom";
import { Context, Dispatcher, StoreGroup } from "almin";
import App from "./component/App";
import { CounterStore } from "./store/CounterStore";
// a single dispatcher
const dispatcher = new Dispatcher();
// a single store
const counterStore = new CounterStore();
// create store group
const storeGroup = new StoreGroup({
    // stateName : store
    counter: counterStore
});
// create context
const appContext = new Context({
    dispatcher,
    store: storeGroup,
    options: {
        // Optional: https://almin.js.org/docs/tips/strict-mode.html
        strict: true
    }
});
ReactDOM.render(<App appContext={appContext} />, document.getElementById("js-app"));
