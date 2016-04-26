// LICENSE : MIT
"use strict";
import React from "react";
import ReactDOM from "react-dom";
import {Context} from "almin";
import {Dispatcher} from "almin";
import {CounterStore} from "../store/CounterStore";
// a single dispatcher
const dispatcher = new Dispatcher();
// a single store
const store = new CounterStore();
const appContext = new Context({
    dispatcher,
    store
});
import Counter from './Counter';
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
            })
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
        return <Counter counterState={counterState}
                        appContext={appContext}/>
    }
}
