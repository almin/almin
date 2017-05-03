// LICENSE : MIT
"use strict";
import React from "react";
import { Context, Dispatcher, StoreGroup } from "almin";
import { CounterStore } from "../store/CounterStore";
// a single dispatcher
const dispatcher = new Dispatcher();
// a single store
const counterStore = new CounterStore();
// create store group
const storeGroup = new StoreGroup({
    // stateName : store
    "counter": counterStore
});
// create context
const appContext = new Context({
    dispatcher,
    store: storeGroup
});
import Counter from "./Counter";
export default class App extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = appContext.getState();
    }

    componentDidMount() {
        // when change store, update component
        const onChangeHandler = () => {
            this.setState(appContext.getState());
        };
        appContext.onChange(onChangeHandler);
    }

    render() {
        /**
         * Where is "CounterState" come from?
         * It is `key` of counterStore in StoreGroup.
         *
         * ```
         * const storeGroup = new StoreGroup({
         *   "counter": counterStore
         * });
         * ```
         * @type {CounterState}
         */
        const counterState = this.state.counter;
        return <Counter counterState={counterState}
                        appContext={appContext}/>;
    }
}
