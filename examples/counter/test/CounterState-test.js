// MIT © 2017 azu
"use strict";
const assert = require("assert");
import { CounterState } from "../src/store/CounterState";

describe("CounterState", () => {
    context("IncrementalCounterUseCase", () => {
        it("should be incremented", () => {
            const state = new CounterState({
                count: 0
            });
            const newState = state.reduce({
                type: "increment"
            });
            assert.ok(newState.count === 1);
        });
    });
});
