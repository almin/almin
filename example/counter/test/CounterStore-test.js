// LICENSE : MIT
"use strict";
const assert = require("assert");
import IncrementalCounterUseCase from "../src/usecase/IncrementalCounterUseCase";
import {CounterStore} from "../src/store/CounterStore";
describe("CounterStore", function () {
    describe("onCountUp", function () {
        it("should new state was count up", function (done) {
            const useCase = new IncrementalCounterUseCase();
            const store = new CounterStore();
            // useCase dispatch to store
            useCase.pipe(store);
            // then
            const expectedCount = 1;
            store.onChange(() => {
                const state = store.getState();
                assert.equal(state.counterState.count, expectedCount);
                done();
            });
            // when
            useCase.execute();
        });
    });
});