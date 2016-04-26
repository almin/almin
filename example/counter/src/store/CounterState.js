// LICENSE : MIT
"use strict";
import CountUpUseCase from "../usecase/CountUpUseCase";
// reduce function
export default class CounterState {
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