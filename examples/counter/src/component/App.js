"use strict";
import React from "react";
import PropTypes from "prop-types";
import { Context } from "almin";
import { CounterState } from "../store/CounterState";
import { Counter } from "./Counter";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        // set initial state
        this.state = props.appContext.getState();
    }
    componentDidMount() {
        const appContext = this.props.appContext;
        // update component's state with store's state when store is changed
        const onChangeHandler = () => {
            this.setState(appContext.getState());
        };
        this.unSubscribe = appContext.onChange(onChangeHandler);
    }

    componentWillUnmount() {
        if (typeof this.unSubscribe === "function") {
            this.unSubscribe();
        }
    }

    render() {
        /**
         * Where is "CounterState" come from?
         * It is a `key` of StoreGroup.
         *
         * ```
         * const storeGroup = new StoreGroup({
         *   "counter": counterStore
         * });
         * ```
         * @type {CounterState}
         */
        const counterState = this.state.counter;
        return <Counter counterState={counterState} appContext={this.props.appContext} />;
    }
}
App.propTypes = {
    appContext: PropTypes.instanceOf(Context).isRequired
};
