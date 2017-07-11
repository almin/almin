// LICENSE : MIT
"use strict";
import React from "react";
import { Context, Dispatcher, StoreGroup, QueuedStoreGroup } from "almin";
import AlminLogger from "../../../src/AlminLogger";
import Counter from "./Counter";
import { CounterStore } from "../store/CounterStore";
// a single dispatcher
const dispatcher = new Dispatcher();
// a single store
const store =
    location.hash === "#queue" ? new QueuedStoreGroup([new CounterStore()]) : new StoreGroup([new CounterStore()]);

const appContext = new Context({
    dispatcher,
    store
});
// setup logging
const logger = new AlminLogger();
logger.startLogging(appContext);
window.alminLogger = logger;
export default class App extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = appContext.getState();
    }

    componentDidMount() {
        // when change store, update component
        const onChangeHandler = () => {
            return requestAnimationFrame(() => {
                this.setState(appContext.getState());
            });
        };
        appContext.onChange(onChangeHandler);
    }

    render() {
        /*
         Where is "CounterState" come from? 
         It is CounterStore#getState()'s key name

         getState() {
             return {
                counterState: this.state
             }
         }
        */
        const counterState = this.state.counterState;
        return <Counter counterState={counterState} appContext={appContext} />;
    }
}
