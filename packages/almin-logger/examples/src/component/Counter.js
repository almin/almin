// LICENSE : MIT
"use strict";
import React from "react"
import AsyncIncreamentalUseCase from "../usecase/AsyncIncreamentalUseCase"
import IncrementalCounterUseCase from "../usecase/IncrementalCounterUseCase"
import DecrementalCounterUseCase from "../usecase/DecrementalCounterUseCase"
import UpDownCounterUseCase from "../usecase/UpDownCounterUseCase"
import {Context} from "almin"
import CounterState from "../store/CounterState"
export default class CounterComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // execute IncrementalCounterUseCase with new count value
        const context = this.props.appContext;
        const asyncIncrement = () => {
            context.useCase(new AsyncIncreamentalUseCase()).execute("arg");
        };
        const increment = () => {
            context.useCase(new IncrementalCounterUseCase()).execute();
        };
        const decrement = () => {
            context.useCase(new DecrementalCounterUseCase()).execute();
        };
        const both = () => {
            context.useCase(new UpDownCounterUseCase()).execute();
        };
        const counterState = this.props.counterState;
        return (
            <div>
                <button onClick={asyncIncrement}>Async Counter ++</button>
                <button onClick={increment}>Counter ++</button>
                <button onClick={decrement}>Counter --</button>
                <button onClick={both}>Counter +-</button>
                <p>
                    Count: {counterState.count}
                </p>
            </div>
        );
    }
}
CounterComponent.propTypes = {
    appContext: React.PropTypes.instanceOf(Context).isRequired,
    counterState: React.PropTypes.instanceOf(CounterState).isRequired
};