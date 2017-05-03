"use strict";
// Hello World in a single file
import { Context, Dispatcher, Store, UseCase } from "almin";
// Store that has the state
class CounterStore extends Store {
    constructor() {
        super();
        this.state = {
            name: "No Name"
        };
    }
    // receive payload from UseCase#dispatch
    receivePayload(payload) {
        if (payload.type === "HELLO") {
            this.setState({
                name: payload.name
            });
        }
    }

    // return own state
    getState() {
        return this.state;
    }
}
// UseCase
class HelloUseCase extends UseCase {
    execute(name) {
        // Dispatch payload ---> CounterStore
        this.dispatch({
            type: "HELLO",
            name
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
      <h1>Hello ${state.name}!</h1>
      <input id="js-name" placeholder="Your name"/>
      <button type="submit" id="js-button">Hello</button>
</div>`;
    // Execute UseCase
    document.getElementById("js-button").addEventListener("click", () => {
        const name = document.getElementById("js-name").value;
        // execute HelloUseCase with name arguments.
        context.useCase(new HelloUseCase()).execute(name);
    });
};
// If the store's state is changed, does call render
context.onChange(render);
// Initial render
render();
