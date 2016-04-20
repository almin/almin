// LICENSE : MIT
"use strict";
const assert = require("assert");
import CountUpUseCase from "../src/usecase/CountUpUseCase"
describe("ActionCreator", function () {
    describe("countUp", function () {
        it("should emit `countUp` event", function (done) {
            const expectedCount = 42;
            const useCase = new CountUpUseCase();
            useCase.onDispatch(payload => {
                assert.deepEqual(payload, {
                    type: CountUpUseCase.name,
                    count: expectedCount
                });
                done();
            });
            useCase.execute(expectedCount);
        });
    });
});