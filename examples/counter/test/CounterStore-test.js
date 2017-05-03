// LICENSE : MIT
"use strict";
const assert = require("assert");
import IncrementalCounterUseCase from "../src/usecase/IncrementalCounterUseCase";
import { CounterStore } from "../src/store/CounterStore";
import { Dispatcher, Context } from "almin";
describe("CounterStore", function() {
    context("when IncrementalCounterUseCase is executed", function() {
        it("should new state was count up", function() {
            const useCase = new IncrementalCounterUseCase();
            const store = new CounterStore();
            const context = new Context({
                dispatcher: new Dispatcher(),
                store
            });
            // then
            return context.useCase(useCase).execute().then(() => {
                const state = store.getState();
                assert.equal(state.count, 1);
            });
        });
    });
});
