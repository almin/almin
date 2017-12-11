"use strict";
import { Store } from "almin";
import { CounterState } from "./CounterState";

export class CounterStore extends Store {
    constructor() {
        super();
        // initial state
        this.state = new CounterState({
            count: 0
        });
    }

    // receive event from UseCase, then update state
    receivePayload(payload) {
        this.setState(this.state.reduce(payload));
    }

    // return own state
    getState() {
        return this.state;
    }
}
