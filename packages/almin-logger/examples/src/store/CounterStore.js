// LICENSE : MIT
"use strict";
import { Store } from "almin";
import CounterState from "./CounterState";
export class CounterStore extends Store {
    constructor() {
        super();
        // initial state
        this.state = new CounterState({
            count: 0
        });
        // receive event from UseCase, then update state
        this.onDispatch(payload => {
            const newState = this.state.reduce(payload);
            if (newState !== this.state) {
                this.state = newState;
                this.emitChange();
            }
        });
    }

    getState() {
        return this.state;
    }
}
