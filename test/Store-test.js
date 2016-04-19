// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import Store from "../src/Store";
import UseCase from "../src/UseCase";
describe("Store", function () {
    describe("#onDispatch", function () {
        it("should called when dispatched", function (done) {
            const store = new Store();
            const expectedPayload = {
                type: "test",
                value: "value"
            };
            // then
            store.onDispatch(payload => {
                assert.deepEqual(payload, expectedPayload);
                done();
            });
            // when
            store.dispatch(expectedPayload);
        });
    });
    describe("#onChange", function () {
        it("should called when changed", function (done) {
            const store = new Store();
            let isCalled = false;
            // then
            store.onChange(() => {
                assert(isCalled);
                done();
            });
            // when
            isCalled = true;
            store.emitChange();
        });
    });
    describe("#onUseCaseError", function () {
        it("should receive error from UseCase", function () {
            const store = new Store();
            class TestUseCase extends UseCase {
                execute() {
                    const domainError = new Error("domain error");
                    domainError.name = "DomainError";
                    this.throwError(domainError);
                }
            }
            const testUseCase = new TestUseCase();
            // delegate
            testUseCase.pipe(store);
            // then
            store.onUseCaseError(testUseCase, (error) => {
                assert.equal(error.name, "DomainError");
                done();
            });
            // when
            store.emitChange();
        });
    });
});