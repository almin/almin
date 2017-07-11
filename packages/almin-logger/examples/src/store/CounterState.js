// LICENSE : MIT
"use strict";
import IncrementalCounterUseCase from "../usecase/IncrementalCounterUseCase";
import DecrementalCounterUseCase from "../usecase/DecrementalCounterUseCase";
// reduce function
export default class CounterState {
    /**
     * @param {Number} count
     */
    constructor({ count }) {
        this.count = count;
    }

    reduce(payload) {
        switch (payload.type) {
            // Increment Counter
            case IncrementalCounterUseCase.name:
                return new CounterState({
                    count: this.count + 1
                });
            case DecrementalCounterUseCase.name:
                return new CounterState({
                    count: this.count - 1
                });
            default:
                return this;
        }
    }
}
