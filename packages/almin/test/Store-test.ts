// LICENSE : MIT
"use strict";
const assert = require("assert");

import { ErrorPayload } from "../src/payload/ErrorPayload";
import { Store } from "../src/Store";
import { UseCase } from "../src/UseCase";
import { createStore } from "./helper/create-new-store";

describe("Store", function() {
    describe("#name", () => {
        describe("when define displayName", () => {
            it("#name is same with displayName", () => {
                class MyStore extends Store {
                    getState() {
                        return {};
                    }
                }

                const expectedName = "Expected Store";
                MyStore.displayName = expectedName;
                const store = new MyStore();
                assert.equal(store.name, expectedName);
            });
        });
    });
    describe("#setState", () => {
        describe("when newState tha is not updatable state", () => {
            it("should not update with newState", () => {
                type State = { key: string };

                class MyStore extends Store<State> {
                    state: State;

                    constructor() {
                        super();
                        this.state = {
                            key: "value"
                        };
                    }

                    shouldStateUpdate(prevState: State, nextState: State) {
                        return prevState.key !== nextState.key;
                    }

                    getState() {
                        return this.state;
                    }
                }

                const store = new MyStore();
                const currentState = store.getState();
                store.setState({
                    key: "value"
                });
                const newState = store.getState();
                assert(currentState === newState);
            });
        });
        describe("when newState that is updatable state", () => {
            it("should not update with newState", () => {
                type State = { key: string };

                class MyStore extends Store<State> {
                    state: State;

                    constructor() {
                        super();
                        this.state = {
                            key: "value"
                        };
                    }

                    shouldStateUpdate(prevState: State, nextState: State) {
                        return prevState.key !== nextState.key;
                    }

                    getState() {
                        return this.state;
                    }
                }

                const store = new MyStore();
                const currentState = store.getState();
                store.setState({
                    key: "difference value"
                });
                const newState = store.getState();
                assert(currentState !== newState);
            });
        });
    });
    describe("#onDispatch", function() {
        it("should called when dispatched", function(done) {
            const store = createStore({ name: "test" });
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
                shouldStateUpdate(_prev: any, _next: any) {
                    // always true
                    return true;
                }

                getState() {
                    return {};
                }
            }

            const store = new CustomShouldStateUpdateStore();
            assert(store.shouldStateUpdate({ a: 1 }, { a: 1 }));
        });
    });
    describe("#onChange", function() {
        it("should called when changed", function(done) {
            const store = createStore({ name: "test" });
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
        // Related https://github.com/almin/almin/issues/190
        describe("when call Store#setState out of UseCase", () => {
            it("should be called Store#onChange", done => {
                type State = number;

                class AStore extends Store<State> {
                    state: State;

                    constructor() {
                        super();
                        this.state = 0;
                    }

                    updateState(state: State) {
                        this.setState(state);
                    }

                    getState() {
                        return this.state;
                    }
                }

                const aStore = new AStore();
                const expectedState: State = 42;
                aStore.onChange(() => {
                    assert.ok(aStore.getState(), expectedState);
                    done();
                });
                aStore.updateState(expectedState);
            });
        });
    });
    describe("#onDispatch", function() {
        describe("when useCaseName is minified", function() {
            it("can receive error from UseCase", function(done) {
                const store = createStore({ name: "test" });

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
            const store = createStore({ name: "test" });

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
