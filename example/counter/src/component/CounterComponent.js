// LICENSE : MIT
"use strict";
import React from "react"
import CountUpUseCase from "../usecase/CountUpUseCase"
import CounterState from "../store/CounterState"
export default class CounterComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    tick() {
        // execute CountUpUseCase with new count value
        const context = this.props.appContext;
        const counterState = this.props.counterState;
        context.useCase(new CountUpUseCase()).execute(counterState.count + 1);
    }

    render() {
        // Call Action ----> ActionCreator
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