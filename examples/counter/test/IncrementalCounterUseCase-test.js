// LICENSE : MIT
"use strict";
const assert = require("assert");
import { IncrementalCounterUseCase } from "../src/usecase/IncrementalCounterUseCase";

describe("ActionCreator", function() {
    describe("countUp", function() {
        it("should emit `countUp` event", function(done) {
            const useCase = new IncrementalCounterUseCase();
            useCase.onDispatch(payload => {
                assert.deepEqual(payload, {
                    type: "increment"
                });
                done();
            });
            useCase.execute();
        });
    });
});
