"use strict";
/**
 * Almin in a single file
 */
import { Context, Dispatcher, Store, UseCase } from "almin";
// State class is pure JavaScript class
class CounterState {
    constructor(count) {
        this.count = count;
    }

    reduce(payload) {
        switch (payload.type) {
            case "INCREMENT":
                return new CounterState(this.count + 1);
            case "DECREMENT":
                return new CounterState(this.count - 1);
            default:
                return this;
        }
    }
}
// Store
class CounterStore extends Store {
    constructor() {
        super();
        this.state = new CounterState(0);
    }

    receivePayload(payload) {
        this.setState(this.state.reduce(payload));
    }

    getState() {
        return this.state;
    }
}
// UseCase
class IncrementUseCase extends UseCase {
    execute() {
        this.dispatch({
            type: "INCREMENT"
        });
    }
}
class DecrementUseCase extends UseCase {
    execute() {
        this.dispatch({
            type: "DECREMENT"
        });
    }
}
// Context is communicator between Store and UseCase
const counterStore = new CounterStore();
const context = new Context({
    dispatcher: new Dispatcher(),
    store: counterStore
});

// View
const render = () => {
    // Update view with state
    const state = context.getState();
    document.body.innerHTML = `<div>
      <h1>count is ${state.count}</h1>
      <button id="js-increment">+</button>
      <button id="js-decrement">-</button>
</div>`;
    // Execute UseCase
    document.getElementById("js-increment").addEventListener("click", () => {
        context.useCase(new IncrementUseCase()).execute();
    });
    document.getElementById("js-decrement").addEventListener("click", () => {
        context.useCase(new DecrementUseCase()).execute();
    });
};
// Observe store change and render
context.onChange(render);
render();
