// LICENSE : MIT
"use strict";
import React from "react"
import CountUpUseCase from "../usecase/CountUpUseCase"
import {CounterState} from "../store/CounterStore"
export default class CounterComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    tick() {
        // execute CountUpUseCase with new count value
        const context = this.props.appContext;
        const CounterState = this.props.CounterState;
        context.useCase(new CountUpUseCase()).execute(CounterState.count + 1);
    }

    render() {
        // Call Action ----> ActionCreator
        const CounterState = this.props.CounterState;
        return (
            <div>
                <button onClick={this.tick.bind(this)}>Count Up</button>
                <p>
                    Count: {CounterState.count}
                </p>
            </div>
        );
    }
}
CounterComponent.propTypes = {
    CounterState: React.PropTypes.instanceOf(CounterState).isRequired
};