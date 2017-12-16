"use strict";
import React from "react";
import PropTypes from "prop-types";
import { IncrementalCounterUseCase } from "../usecase/IncrementalCounterUseCase";
import { Context } from "almin";
import { CounterState } from "../store/CounterState";

export class Counter extends React.Component {
    incrementCounter() {
        // execute IncrementalCounterUseCase with new count value
        const context = this.props.appContext;
        context.useCase(new IncrementalCounterUseCase()).execute();
    }

    render() {
        // execute UseCase ----> Store
        const counterState = this.props.counterState;
        return (
            <div>
                <button onClick={this.incrementCounter.bind(this)}>Increment Counter</button>
                <p>Count: {counterState.count}</p>
            </div>
        );
    }
}

Counter.propTypes = {
    appContext: PropTypes.instanceOf(Context).isRequired,
    counterState: PropTypes.instanceOf(CounterState).isRequired
};
