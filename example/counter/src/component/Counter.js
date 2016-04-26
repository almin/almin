// LICENSE : MIT
"use strict";
import React from "react"
import IncrementalCounterUseCase from "../usecase/IncrementalCounterUseCase"
import CounterState from "../store/CounterState"
export default class CounterComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    tick() {
        // execute IncrementalCounterUseCase with new count value
        const context = this.props.appContext;
        const counterState = this.props.counterState;
        context.useCase(new IncrementalCounterUseCase()).execute(counterState.count + 1);
    }

    render() {
        // execute UseCase ----> Store
        const counterState = this.props.counterState;
        return (
            <div>
                <button onClick={this.tick.bind(this)}>Count Up</button>
                <p>
                    Count: {counterState.count}
                </p>
            </div>
        );
    }
}
CounterComponent.propTypes = {
    counterState: React.PropTypes.instanceOf(CounterState).isRequired
};