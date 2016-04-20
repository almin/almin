// LICENSE : MIT
"use strict";
const assert = require("assert");
import CountUpUseCase from "../src/usecase/CountUpUseCase"
import {CounterStore} from "../src/store/CounterStore"
describe("CounterStore", function () {
    describe("onCountUp", function () {
        it("should new state was count up", function (done) {
            const useCase = new CountUpUseCase();
            const store = new CounterStore();
            // useCase dispatch to store
            useCase.pipe(store);
            // then
            const expectedCount = 42;
            store.onChange(() => {
                const state = store.getState();
                assert.equal(state.CounterState.count, expectedCount);
                done();
            });
            // when
            useCase.execute(expectedCount)
        });
    });
});