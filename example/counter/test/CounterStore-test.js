// LICENSE : MIT
"use strict";
import assert from "power-assert"
import Store from "../examples/counter/src/CounterStore"
import {keys} from "../examples/counter/src/ActionCreator";
describe("Store", function () {
    describe("onCountUp", function () {
        it("should emit `CHANGE` event", function () {
            const store = new Store();
            var expectedCount = 42;
            var newState = store.reduce(store.getState(), {
                type: keys.countUp,
                count: expectedCount
            });
            assert.equal(newState.count, expectedCount);
        });
    });
});