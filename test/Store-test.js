// LICENSE : MIT
"use strict";
const assert = require("power-assert");

import { Store } from "../lib/Store";
import { createStore } from "./helper/create-store";
import { UseCase } from "../lib/UseCase";
import { ErrorPayload } from "../lib/payload/ErrorPayload";

describe("Store", function() {
    describe("#name", () => {
        context("when define displayName", () => {
            it("#name is same with displayName", () => {
                class MyStore extends Store {
                }
                const expectedName = "Expected Store";
                MyStore.displayName = expectedName;
                const store = new MyStore();
                assert.equal(store.name, expectedName);
            });
        });
    });
    describe("#getState", () => {
        context("when has not implemented", () => {
            it("throw error", () => {
                class MyStore extends Store {
                }
                const store = new MyStore();
                assert.throws(() => {
                    store.getState();
                }, /should be implemented/);
            });
        });
    });
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
    describe("#shouldStateUpdate", () => {
        it("default implementation is shallow equal", () => {
            const store = createStore({ name: "TestStore" });
            const prevState = {
                a: 1
            };
            const nextState = {
                a: 1
            };
            const nextChangedState = {
                a: 2
            };
            // if the state is not changed, return false
            assert(store.shouldStateUpdate(prevState, nextState) === false);
            // if the state is changed, return true
            assert(store.shouldStateUpdate(prevState, nextChangedState));
            // The arguments is not object, return false
            assert(store.shouldStateUpdate(1, 1) === false);
            // The arguments is empty object, return false
            assert(store.shouldStateUpdate({}, {}) === false);
        });
        it("can override by sub class", () => {
            class CustomShouldStateUpdateStore extends Store {
                shouldStateUpdate(prev, next) {
                    // always true
                    return true;
                }
            }
            const store = new CustomShouldStateUpdateStore();
            assert(store.shouldStateUpdate({ a: 1 }, { a: 1 }));
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
    describe("#onDispatch", function() {
        context("when useCaseName is minified", function() {
            it("can receive error from UseCase", function(done) {
                const store = new Store();
                class TestUseCase extends UseCase {
                    execute() {
                        const domainError = new Error("domain error");
                        domainError.name = "DomainError";
                        this.throwError(domainError);
                    }
                }
                const testUseCase = new TestUseCase();
                testUseCase.name = "minified";
                // delegate
                testUseCase.pipe(store);
                // then
                store.onDispatch((payload, meta) => {
                    if (payload instanceof ErrorPayload) {
                        assert(meta.useCase instanceof TestUseCase);
                        assert.equal(payload.error.name, "DomainError");
                        done();
                    }
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
            store.onDispatch((payload, meta) => {
                if (payload instanceof ErrorPayload) {
                    assert(meta.useCase instanceof TestUseCase);
                    assert.equal(payload.error.name, "DomainError");
                    done();
                }
            });
            // when
            testUseCase.execute();
        });
    });
});
