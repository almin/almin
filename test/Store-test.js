// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import Context from "../src/Context";
import Dispatcher from "../src/Dispatcher";
import Store from "../src/Store";
import UseCase from "../src/UseCase";
describe("Store", function() {
    describe("#onDispatch", function() {
        it("should called when dispatched", function(done) {
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
    describe("#onChange", function() {
        it("should called when changed", function(done) {
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
    describe("#onError", function() {
        context("when UseCase is failed", function() {
            it("should be called", function(done) {
                const store = new Store();
                class TestUseCase extends UseCase {
                    execute() {
                        const error = new Error("fail");
                        error.name = "TestUseCaseError";
                        return Promise.reject(error);
                    }
                }
                const useCase = new TestUseCase();
                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: store
                });
                let isCalled = false;
                store.onError(payload => {
                    isCalled = true;
                    assert(payload.useCase instanceof TestUseCase);
                    assert.equal(payload.error.name, "TestUseCaseError");
                    done();
                });
                // when
                return context.useCase(useCase).execute().catch((error) => {
                    assert(error instanceof Error);
                    assert(isCalled);
                });
            });
        });
        context("when useCaseName is minified", function() {
            it("should receive error from UseCase", function(done) {
                const store = new Store();
                class TestUseCase extends UseCase {
                    execute() {
                        const domainError = new Error("domain error");
                        domainError.name = "DomainError";
                        this.throwError(domainError);
                    }
                }
                const testUseCase = new TestUseCase();
                testUseCase.useCaseName = "minified";
                // delegate
                testUseCase.pipe(store);
                // then
                store.onError(payload => {
                    assert(payload.useCase instanceof TestUseCase);
                    assert.equal(payload.error.name, "DomainError");
                    done();
                });
                // when
                testUseCase.execute();
            });
        });
        it("should receive error from UseCase", function(done) {
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
            store.onError((payload) => {
                assert(payload.useCase instanceof TestUseCase);
                assert.equal(payload.error.name, "DomainError");
                done();
            });
            // when
            testUseCase.execute();
        });
    });
});