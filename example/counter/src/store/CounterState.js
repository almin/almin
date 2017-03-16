// LICENSE : MIT
"use strict";
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
            case "increment":
                return new CounterState({
                    count: this.count + 1
                });
            default:
                return this;
        }
    }
}
