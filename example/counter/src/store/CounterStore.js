// LICENSE : MIT
"use strict";
import {Store} from "almin";
import CountUpUseCase from "../usecase/CountUpUseCase";
// reduce function
export class CounterState {
    /**
     * @param {Number} count
     */
    constructor({count}) {
        this.count = count;
    }

    reduce(payload) {
        switch (payload.type) {
            case CountUpUseCase.name:
                return new CounterState({
                    count: payload.count
                });
            default:
                return this;
        }
    }
}
export class CounterStore extends Store {
    constructor() {
        super();
        // initial state
        this.state = new CounterState({
            count: 0
        });
        // receive event from usecase, then update state
        this.onDispatch(payload => {
            const newState = this.state.reduce(payload);
            if (newState !== this.state) {
                this.state = newState;
                this.emitChange();
            }
        })
    }

    getState() {
        return {
            CounterState: this.state
        }
    }
}