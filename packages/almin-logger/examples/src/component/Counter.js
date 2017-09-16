// LICENSE : MIT
"use strict";
import React from "react";
import AsyncIncreamentalUseCase from "../usecase/AsyncIncreamentalUseCase";
import IncrementalCounterUseCase from "../usecase/IncrementalCounterUseCase";
import DecrementalCounterUseCase from "../usecase/DecrementalCounterUseCase";
import UpDownCounterUseCase from "../usecase/UpDownCounterUseCase";
import ManuallLoggingUseCase from "../usecase/ManuallLoggingUseCase";
import ThrowErrorUseCase from "../usecase/ThrowErrorUseCase";
import { Context } from "almin";
import CounterState from "../store/CounterState";

export default class CounterComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // execute IncrementalCounterUseCase with new count value
        const context = this.props.appContext;
        const asyncIncrement = () => {
            context.useCase(new AsyncIncreamentalUseCase()).execute("argument");
        };
        const increment = () => {
            context.useCase(new IncrementalCounterUseCase()).execute();
        };
        const decrement = () => {
            context.useCase(new DecrementalCounterUseCase()).execute();
        };
        const parallel = () => {
            context.useCase(new IncrementalCounterUseCase()).execute();
            context.useCase(new DecrementalCounterUseCase()).execute();
        };
        const both = () => {
            context.useCase(new UpDownCounterUseCase()).execute();
        };
        const manuallLogging = () => {
            context.useCase(new ManuallLoggingUseCase()).execute(window.alminLogger);
        };
        const throwError = () => {
            context.useCase(new ThrowErrorUseCase()).execute();
        };
        const transaction = () => {
            context.transaction("+1 -1 +1 +1 = +2", transactionContext => {
                return (
                    Promise.resolve()
                        .then(() => transactionContext.useCase(new IncrementalCounterUseCase()).execute())
                        .then(() => transactionContext.useCase(new DecrementalCounterUseCase()).execute())
                        // add 500ms delay
                        .then(() => new Promise(resolve => setTimeout(resolve, 500)))
                        .then(() => transactionContext.useCase(new IncrementalCounterUseCase()).execute())
                        .then(() => transactionContext.useCase(new IncrementalCounterUseCase()).execute())
                        .then(() => {
                            transactionContext.commit();
                        })
                );
            });
        };
        const counterState = this.props.counterState;

        return (
            <div>
                <button onClick={asyncIncrement}>Async Counter +1</button>
                <button onClick={increment}>Counter +1</button>
                <button onClick={decrement}>Counter -1</button>
                <button onClick={both}>Counter +-</button>
                <button onClick={parallel}>Counter +- in parallel</button>
                <button onClick={manuallLogging}>Manuall Logging</button>
                <button onClick={throwError}>Throw Error in UseCase</button>
                <button onClick={transaction}>Transaction(+1 -1 +1 +1)</button>
                <p>Count: {counterState.count}</p>
            </div>
        );
    }
}
CounterComponent.propTypes = {
    appContext: React.PropTypes.instanceOf(Context).isRequired,
    counterState: React.PropTypes.instanceOf(CounterState).isRequired
};
