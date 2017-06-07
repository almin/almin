// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const sinon = require("sinon");
import { Payload } from "../lib/payload/Payload";
import { ChangedPayload } from "../lib/index";
import { DidExecutedPayload } from "../lib/payload/DidExecutedPayload";
import { CompletedPayload } from "../lib/payload/CompletedPayload";
import { Store } from "../lib/Store";
import { StoreGroup, InitializedPayload } from "../lib/UILayer/StoreGroup";
import { createStore } from "./helper/create-new-store";
import { UseCase } from "../lib/UseCase";
import { Context } from "../lib/Context";
import { Dispatcher } from "../lib/Dispatcher";

const createAsyncChangeStoreUseCase = (store) => {
    class ChangeTheStoreUseCase extends UseCase {
        execute() {
            return Promise.resolve().then(() => {
                const newState = { a: {} };
                store.updateState(newState);
            });
        }
    }

    return new ChangeTheStoreUseCase()
};
const createChangeStoreUseCase = (store) => {
    class ChangeTheStoreUseCase extends UseCase {
        execute() {
            const newState = { a: {} };
            store.updateState(newState);
        }
    }

    return new ChangeTheStoreUseCase();
};
describe("StoreGroup", function() {
    describe("constructor(map)", () => {
        it("throw error when invalid arguments", () => {
            assert.throws(() => {
                new StoreGroup(null);
            }, Error, "arguments should be object");
            assert.throws(() => {
                new StoreGroup();
            }, Error, "arguments should be object");
            assert.throws(() => {
                new StoreGroup([]);
            }, Error, "arguments should be object");
            assert.throws(() => {
                new StoreGroup({
                    a: 1,
                    b: 2
                });
            }, /should be instance of Store/);
        });
        it("support stateName and store mapping ", () => {
            class AStateStore extends Store {
                getState() {
                    return "a";
                }
            }

            class BStateStore extends Store {
                getState() {
                    return "b";
                }
            }

            const aStore = new AStateStore();
            const bStore = new BStateStore();
            const storeGroup = new StoreGroup({
                a: aStore,
                b: bStore
            });
            assert.deepEqual(storeGroup.getState(), {
                a: "a",
                b: "b"
            });
        });
    });
    describe("#emitChange", function() {
        context("when any store is not changed", function() {
            it("should not call onChange", function() {
                const store = createStore({ name: "AStore" });
                const storeGroup = new StoreGroup({
                    a: store
                });
                let isCalled = false;
                // then
                storeGroup.onChange(() => {
                    isCalled = true;
                });
                // when
                storeGroup.emitChange();
                // But any store is not changed
                assert(isCalled === false);
            });
        });
    });
    describe("#onChange", function() {
        it("when actually store's state is changed", () => {
            it("call onChange handler", () => {
                const store = createStore({
                    name: "AStore",
                    state: 1
                });
                const storeGroup = new StoreGroup({ a: store });
                let isCalled = false;
                // then
                storeGroup.onChange(() => {
                    isCalled = true;
                });
                // when
                store.updateState(2);
                assert(isCalled);
            });
        });
        context("when UseCase never change any store", function() {
            it("should not be called", function() {
                const store = createStore({ name: "AStore" });
                const storeGroup = new StoreGroup({
                    a: store
                });
                let isCalled = false;
                // then
                storeGroup.onChange(() => {
                    isCalled = true;
                });
                // when
                const useCase = new class NopeUseCase extends UseCase {
                    execute() {
                        // not change any store
                    }
                };
                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                return context.useCase(useCase).execute().then(() => {
                    assert(isCalled === false);
                });
            });
        });
        context("onChange(changingStores)", () => {
            it("should changingStores are changed own state", () => {
                const storeA = createStore({ name: "AStore" });
                const storeB = createStore({ name: "BStore" });
                const storeGroup = new StoreGroup({
                    AStore: storeA,
                    BStore: storeB
                });
                let changedStores = [];
                storeGroup.onChange((changingStores) => {
                    changedStores = changingStores;
                });

                // when
                class ChangeUseCase extends UseCase {
                    execute() {
                        storeA.updateState({ a: 1 });
                        storeB.updateState({ b: 2 });
                    }
                }

                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                // when
                const useCase = new ChangeUseCase();
                return context.useCase(useCase).execute().then(() => {
                    assert.equal(changedStores.length, 2);
                    // no specify in order
                    assert.deepEqual(changedStores.sort(), [storeA, storeB].sort());
                });
            });
        });
        // sync
        context("when SyncUseCase change the store", function() {
            it("should be called by sync", function() {
                const store = createStore({ name: "AStore" });
                const storeGroup = new StoreGroup({
                    AStore: store
                });
                let isCalled = false;
                // then
                storeGroup.onChange(() => {
                    isCalled = true;
                });
                // when
                const useCase = createChangeStoreUseCase(store);
                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                context.useCase(useCase).execute();
                // sync change!!!
                assert(isCalled);
            });
        });
        // async
        context("when ASyncUseCase change the store", function() {
            it("should be called by async", function() {
                const store = createStore({ name: "" });
                const storeGroup = new StoreGroup({
                    AStore: store
                });
                let isCalled = false;
                storeGroup.onChange(() => {
                    isCalled = true;
                });
                // when
                const asyncUseCase = createAsyncChangeStoreUseCase(store);
                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                // then
                const promise = context.useCase(asyncUseCase).execute().then(() => {
                    assert(isCalled, "after");
                });
                // not yet change
                assert(isCalled === false, "before");
                return promise;
            });
        });
        context("when UseCase is nesting", function() {
            context("{ asap: true }", function() {
                it("should be called by all UseCases", function() {
                    const aStore = createStore({ name: "AStore" });
                    const bStore = createStore({ name: "BStore" });
                    const storeGroup = new StoreGroup({ a: aStore, b: bStore }, {
                        asap: true
                    });
                    let onChangeCounter = 0;
                    storeGroup.onChange(() => {
                        onChangeCounter += 1;
                    });
                    // when
                    const changeBUseCase = createAsyncChangeStoreUseCase(bStore);

                    class ChangeAAndBUseCase extends UseCase {
                        execute() {
                            return this.context.useCase(changeBUseCase).execute().then(() => {
                                aStore.updateState({ a: 1 });
                            });
                        }
                    }

                    const context = new Context({
                        dispatcher: new Dispatcher(),
                        store: storeGroup
                    });
                    // then
                    const useCase = new ChangeAAndBUseCase();
                    return context.useCase(useCase).execute().then(() => {
                        assert.equal(onChangeCounter, 2);
                    });
                });
            });
            context("when UseCase#dispatch is called", function() {
                it("should not be called - no changing store", function() {
                    const store = createStore({ name: "AStore" });
                    const storeGroup = new StoreGroup({ a: store });
                    let isChanged = false;
                    let dispatchedPayload = null;
                    storeGroup.onChange(() => {
                        isChanged = true;
                    });

                    // when
                    class DispatchAndFinishAsyncUseCase extends UseCase {
                        execute() {
                            // dispatch event
                            this.dispatch({
                                type: "DispatchAndFinishAsyncUseCase"
                            });
                            return new Promise((resolve) => {
                                setTimeout(resolve, 100);
                            });
                        }
                    }

                    const context = new Context({
                        dispatcher: new Dispatcher(),
                        store: storeGroup
                    });
                    context.onDispatch(payload => {
                        dispatchedPayload = payload;
                    });
                    // when
                    const useCase = new DispatchAndFinishAsyncUseCase();
                    const resultPromise = context.useCase(useCase).execute();
                    // then - should not be changed, but it is dispatched
                    assert(isChanged === false);
                    assert.deepEqual(dispatchedPayload, {
                        type: "DispatchAndFinishAsyncUseCase"
                    });
                    return resultPromise
                });
                it("should be called by sync", function() {
                    const store = createStore({ name: "AStore" });
                    const storeGroup = new StoreGroup({ a: store });
                    let isCalled = false;
                    storeGroup.onChange(() => {
                        isCalled = true;
                    });

                    // when
                    class DispatchAndFinishAsyncUseCase extends UseCase {
                        execute() {
                            // store is changed
                            store.updateState({ a: 1 });
                            // dispatch event
                            this.dispatch({
                                type: "DispatchAndFinishAsyncUseCase"
                            });
                            return new Promise((resolve) => {
                                setTimeout(resolve, 100);
                            });
                        }
                    }

                    const context = new Context({
                        dispatcher: new Dispatcher(),
                        store: storeGroup
                    });
                    // when
                    const useCase = new DispatchAndFinishAsyncUseCase();
                    const resultPromise = context.useCase(useCase).execute();
                    // then - should be called by sync
                    assert(isCalled);
                    return resultPromise
                });
                it("should be called each dispatch", function() {
                    const store = createStore({ name: "AStore" });
                    const storeGroup = new StoreGroup({ a: store });
                    let calledCount = 0;
                    storeGroup.onChange(() => {
                        calledCount++;
                    });

                    // when
                    class DispatchAndFinishAsyncUseCase extends UseCase {
                        execute() {
                            // 1
                            store.updateState({ a: 1 });
                            this.dispatch({
                                type: "DispatchAndFinishAsyncUseCase"
                            });
                            // 2
                            store.updateState({ a: 2 });
                            this.dispatch({
                                type: "DispatchAndFinishAsyncUseCase"
                            });
                        }
                    }

                    const context = new Context({
                        dispatcher: new Dispatcher(),
                        store: storeGroup
                    });
                    // when
                    const useCase = new DispatchAndFinishAsyncUseCase();
                    return context.useCase(useCase).execute().then(() => {
                        assert.equal(calledCount, 2)
                    });
                });
            });
        });
        context("when UseCase throwing Error", function() {
            it("should be called", function() {
                const aStore = createStore({ name: "AStore" });
                const storeGroup = new StoreGroup({ a: aStore });
                let onChangeCounter = 0;
                storeGroup.onChange(() => {
                    onChangeCounter += 1;
                });

                // when
                class FailUseCase extends UseCase {
                    execute() {
                        aStore.updateState({ a: 1 });
                        return Promise.reject(new Error("emit change but fail UseCase"));
                    }
                }

                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                // then
                const useCase = new FailUseCase();
                return context.useCase(useCase).execute().catch(() => {
                    assert.equal(onChangeCounter, 1);
                });
            });
        });
        context("when UseCase call `throwError()", function() {
            it("should be called", function() {
                const store = createStore({ name: "AStore" });
                const storeGroup = new StoreGroup({ a: store });
                let isCalled = false;
                // then
                storeGroup.onChange(() => {
                    isCalled = true;
                });
                // when
                const useCase = new class ThrowErrorUseCase extends UseCase {
                    execute() {
                        store.updateState({ a: 1 });
                        // dispatch event
                        this.throwError(new Error("error message"));
                    }
                };
                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                return context.useCase(useCase).execute().then(() => {
                    assert(isCalled);
                });
            });
        });
        context("WhiteBox testing", function() {
            it("should thin out change events at once", function() {
                const aStore = createStore({ name: "AStore" });
                const bStore = createStore({ name: "BStore" });
                const storeGroup = new StoreGroup({ a: aStore, b: bStore });

                class ChangeABUseCase extends UseCase {
                    execute() {
                        aStore.updateState({ a: 1 });
                        aStore.emitChange(); // *1
                        bStore.updateState({ b: 1 });
                        bStore.emitChange(); // *2
                    }
                }

                const useCase = new ChangeABUseCase();
                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                // then - called change handler a one-time
                let calledCount = 0;
                storeGroup.onChange((changedStores) => {
                    calledCount++;
                    assert.equal(changedStores.length, 2);
                });
                // when
                return context.useCase(useCase).execute().then(() => {
                    // collect up *1 and *2
                    // Store#onChange in StoreGroup only add changing queue.
                    assert.equal(calledCount, 1, "onChange is called just once");
                });
            });
            context("when the UseCase don't return a promise", () => {
                it("StoreGroup#emitChange is called just one time", function() {
                    const aStore = createStore({ name: "AStore" });
                    const storeGroup = new StoreGroup({ a: aStore });

                    class ChangeAUseCase extends UseCase {
                        execute() {
                            aStore.updateState({ a: 1 });
                        }
                    }

                    const useCase = new ChangeAUseCase();
                    const context = new Context({
                        dispatcher: new Dispatcher(),
                        store: storeGroup
                    });
                    // then - called change handler a one-time
                    let calledCount = 0;
                    // override
                    storeGroup.onChange(() => {
                        calledCount++;
                    });
                    // when
                    return context.useCase(useCase).execute().then(() => {
                        assert.equal(calledCount, 1, "StoreGroup#emitChange is called just once");
                    });
                })
            });
        });
        context("Sync Change and Async Change in Edge case", function() {
            /*
            This useCase should update twice
                execute(){
                    model.count = 1; *1
                    // DidExecute -> refresh
                    return Promise.resolve().then(() => {
                        model.count = 2; * 1
                    }); // Complete -> refresh
                }

             */
            it("should pass twice update scenario", function() {
                const store = createStore({ name: "AStore" });
                const storeGroup = new StoreGroup({ a: store });
                const asyncUseCase = createAsyncChangeStoreUseCase(store);

                class ChangeTheStoreUseCase extends UseCase {
                    execute() {
                        store.updateState({ a: 1 });
                        return this.context.useCase(asyncUseCase).execute();
                        // complete => update
                    } // didExecute => update
                }

                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                // count
                let calledCount = 0;
                storeGroup.onChange(() => {
                    calledCount++;
                });
                const useCase = new ChangeTheStoreUseCase();
                // when
                return context.useCase(useCase).execute().then(() => {
                    assert.equal(calledCount, 2);
                });
            });
        });
        context("onChange calling flow example", function() {
            it("should call onChange in order", function() {
                const aStore = createStore({ name: "AStore" });
                const bStore = createStore({ name: "BStore" });
                const cStore = createStore({ name: "CStore" });
                const storeGroup = new StoreGroup({
                    a: aStore,
                    b: bStore,
                    c: cStore
                });

                class ParentUseCase extends UseCase {
                    execute() {
                        const aUseCase = new ChildAUseCase();
                        const bUseCase = new ChildBUseCase();
                        return Promise.all([
                            this.context.useCase(aUseCase).execute(),
                            this.context.useCase(bUseCase).execute()
                        ]).then(() => {
                            cStore.updateState({ c: 1 });
                            cStore.emitChange();
                        });
                    }
                }

                class ChildAUseCase extends UseCase {
                    execute() {
                        return new Promise((resolve) => {
                            aStore.updateState({ a: 1 });
                            aStore.emitChange();
                            resolve();
                        });
                    }
                }

                class ChildBUseCase extends UseCase {
                    execute() {
                        return new Promise((resolve) => {
                            bStore.updateState({ b: 1 });
                            bStore.emitChange();
                            resolve();
                        });
                    }
                }

                const useCase = new ParentUseCase();
                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                // then - called change handler a one-time
                let actualChangedStores = [];
                storeGroup.onChange((changedStores) => {
                    actualChangedStores = actualChangedStores.concat(changedStores);
                });
                // when
                return context.useCase(useCase).execute().then(() => {
                    assert.equal(actualChangedStores.length, 3);
                    assert.deepEqual(actualChangedStores, [
                        aStore,
                        bStore,
                        cStore
                    ]);
                });
            });
        });
        context("When StoreGroup calling Store#receivePayload", function() {
            it("should call count is necessary and sufficient for performance", function() {
                class AStore extends Store {
                    constructor() {
                        super();
                        this.state = {};
                        this.receivedPayloadList = [];
                    }

                    receivePayload(payload) {
                        this.receivedPayloadList.push(payload);
                        if (payload.type === "test") {
                            this.setState({ newKey: "update" });
                        }
                    }

                    getState() {
                        return this.state;
                    }
                }

                const aStore = new AStore();
                const storeGroup = new StoreGroup({ a: aStore });
                // when
                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });

                class ExamplePayload extends Payload {
                    constructor() {
                        super({ type: "test" });
                    }
                }

                const useCaseSync = ({ dispatcher }) => {
                    return () => {
                        dispatcher.dispatch(new ExamplePayload());
                    };
                };
                const useCaseASync = ({ dispatcher }) => {
                    return () => {
                        dispatcher.dispatch(new ExamplePayload());
                        return Promise.resolve();
                    };
                };
                // calling order of Store#receivedPay
                const expectedReceivedPayloadList = [
                    // StoreGroup Initialize
                    InitializedPayload,
                    // Sync UseCase
                    ExamplePayload,
                    DidExecutedPayload,
                    // Async UseCase,
                    ExamplePayload,
                    DidExecutedPayload,
                    CompletedPayload,
                ];
                // then
                return context.useCase(useCaseSync).execute().then(() => {
                    return context.useCase(useCaseASync).execute();
                }).then(() => {
                    assert.ok(aStore.receivedPayloadList.length === expectedReceivedPayloadList.length);
                    aStore.receivedPayloadList.forEach((payload, index) => {
                        const ExpectedPayloadClass = expectedReceivedPayloadList[index];
                        assert.ok(payload instanceof ExpectedPayloadClass, `${payload} instanceof ${ExpectedPayloadClass}`);
                    });
                });
            });
        });
        context("when Store#emitChange before receivePayload", function() {
            it("arguments includes the store", function() {
                const aStore = createStore({ name: "AStore" });
                const storeGroup = new StoreGroup({ a: aStore });
                let actualStores = [];
                storeGroup.onChange((stores) => {
                    actualStores = actualStores.concat(stores);
                });
                // when
                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                // This useCas reset actualStores,
                // It aim to detect storeChanging in the between did and completed
                const useCase = () => {
                    return () => {
                        actualStores = [];
                        aStore.updateState({ a: "new value" });
                        aStore.emitChange();
                    };
                };
                // then
                return context.useCase(useCase).execute().then(() => {
                    assert.deepEqual(actualStores, [aStore]);
                });
            });
        });
        context("when Store is changed in receivePayload", function() {
            it("arguments includes the store", function() {
                class AStore extends Store {
                    constructor() {
                        super();
                        this.state = { key: "initial" };
                    }

                    receivePayload(payload) {
                        if (payload instanceof InitializedPayload) {
                            return;
                        }
                        this.state = { key: "receivePayload" };
                    }

                    getState() {
                        return this.state;
                    }
                }

                const aStore = new AStore();
                const storeGroup = new StoreGroup({ a: aStore });
                let actualStores = [];
                storeGroup.onChange((stores) => {
                    actualStores = actualStores.concat(stores);
                });
                // when
                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                // This useCas reset actualStores,
                // It aim to detect storeChanging in the between did and completed
                const useCase = () => {
                    return () => {
                        actualStores = [];
                    };
                };
                // then
                return context.useCase(useCase).execute().then(() => {
                    assert.deepEqual(actualStores, [aStore]);
                });
            });
        });
    });
    describe("#getState", function() {
        it("should return a single state object", function() {
            class AStore extends Store {
                getState() {
                    return "a value";
                }
            }

            class BStore extends Store {
                getState() {
                    return "b value";
                }
            }

            const aStore = new AStore();
            const bStore = new BStore();
            const storeGroup = new StoreGroup({ a: aStore, b: bStore });
            // when - a,b emit change at same time
            const state = storeGroup.getState();
            // then - return a single state object that contain each store and merge
            assert.deepEqual(state, {
                a: "a value",
                b: "b value"
            });
        });
        context("when getState() return State object", function() {
            it("should return a single state has {<key>: state} of return Store#getState", function() {
                class AState {
                }

                class AStore extends Store {
                    getState() {
                        return new AState();
                    }
                }

                class BState {
                }

                class BStore extends Store {
                    getState() {
                        return new BState();
                    }
                }

                const aStore = new AStore();
                const bStore = new BStore();
                const storeGroup = new StoreGroup({ a: aStore, b: bStore });
                // when - a,b emit change at same time
                const state = storeGroup.getState();
                // then - return a single state object that contain each store and merge
                const keys = Object.keys(state);
                assert(keys.indexOf("a") !== -1);
                assert(state["a"] instanceof AState);
                assert(state["b"] instanceof BState);
            });
        });
    });
    context("Warning", () => {
        let consoleErrorStub = null;
        beforeEach(() => {
            consoleErrorStub = sinon.stub(console, "error");
        });
        afterEach(() => {
            consoleErrorStub.restore();
        });
        it("should check that a Store returned state immutability", function() {
            const store = createStore({ name: "AStore" });

            class EmitStoreUseCase extends UseCase {
                execute() {
                    // When the store is not changed, but call emitChange
                    store.emitChange();
                }
            }

            const context = new Context({
                dispatcher: new Dispatcher(),
                store: new StoreGroup({
                    a: store
                })
            });
            return context.useCase(new EmitStoreUseCase()).execute().then(() => {
                assert.equal(consoleErrorStub.callCount, 1, "It throw immutable warning");
            });
        });
        // See https://github.com/almin/almin/pull/205
        it("State changing: A -> B -> A by Store#emitChange should not warn", function() {
            const state = { value: "init" };

            class MyStore extends Store {
                constructor() {
                    super();
                    this.state = Object.assign({}, state);
                }

                checkUpdate() {
                    this.setState(Object.assign({}, state));
                }

                receivePayload() {
                    // 3. directly state modified
                    // It test _emitChangeStateCacheMap is pruned
                    this.state = {
                        value: "next"
                    };
                }

                getState() {
                    return this.state;
                }
            }

            const store = new MyStore();
            const storeGroup = new StoreGroup({
                a: store
            });

            class TransactionUseCase extends UseCase {
                execute() {
                    // 1. change
                    state.value = "next";
                    // emit change
                    store.checkUpdate();
                    // 2. revert
                    state.value = "init"; // <= same with initial state
                    // re-emit change:
                    // result: the `store` is not changed
                    store.checkUpdate();
                }
            }

            const context = new Context({
                dispatcher: new Dispatcher(),
                store: storeGroup
            });
            // init -> next -> init
            return context.useCase(new TransactionUseCase()).execute().then(() => {
                return context.useCase(new TransactionUseCase()).execute();
            }).then(() => {
                assert.equal(consoleErrorStub.callCount, 0, `It should not warn .
init -> next -> init in a execution of UseCase should be valid.
Something wrong implementation of calling Store#emitChange at multiple`);
            });
        });
        it("should check that a Store's state is changed but shouldStateUpdate return false", function() {
            class AStore extends Store {
                constructor() {
                    super();
                    this.state = {
                        a: "value"
                    };
                }

                getState() {
                    return this.state;
                }
            }

            const store = new AStore();
            const storeGroup = new StoreGroup({
                a: store
            });
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: storeGroup
            });
            // When the store is not changed, but call emitChange
            const useCase = ({ dispatcher }) => {
                return () => {
                    // reference is change but shall-equal return false
                    store.state = {
                        a: "value"
                    };
                };
            };
            return context.useCase(useCase).execute().then(() => {
                assert.ok(consoleErrorStub.calledOnce);
            });
        });
        context("Not support warning case", () => {
            it("directly modified and emitChange is mixed, we can't show warning", function() {
                class AStore extends Store {
                    constructor() {
                        super();
                        this.state = {
                            a: "value"
                        };
                    }

                    getState() {
                        return this.state;
                    }
                }

                const store = new AStore();
                const storeGroup = new StoreGroup({
                    a: store
                });
                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                // When the store is not changed, but call emitChange
                const useCase = ({ dispatcher }) => {
                    return () => {
                        // emitChange style
                        store.setState({
                            a: "1"
                        });
                        // directly modified style
                        store.state = {
                            a: "value"
                        };
                    };
                };
                return context.useCase(useCase).execute().then(() => {
                    assert.equal(consoleErrorStub.callCount, 0, "Can't support this case");
                });
            });
        })
    });
    describe("#release", function() {
        it("release onChange handler", function() {
            const aStore = createStore({ name: "AStore" });
            const bStore = createStore({ name: "BStore" });
            const storeGroup = new StoreGroup({ a: aStore, b: bStore });
            // then - called change handler a one-time
            let isCalled = false;
            storeGroup.onChange(() => {
                isCalled = true;
            });
            storeGroup.release();
            storeGroup.emitChange();
            assert(!isCalled);
        });
    });
    describe("#receivePayload", () => {
        it("UseCase dispatch payload -> Store should receive it", () => {
            class AState {
                constructor(count) {
                    this.count = count;
                }

                reduce(payload) {
                    switch (payload.type) {
                        case "increment":
                            return new AState(this.count + 1);
                        case "decrement":
                            return new AState(this.count - 1);
                        default:
                            return this;
                    }
                }
            }

            class AStore extends Store {
                constructor() {
                    super();
                    this.state = new AState(0);
                }

                /**
                 * update state
                 * @param {Payload} payload
                 */
                receivePayload(payload) {
                    this.state = this.state.reduce(payload);
                }

                getState() {
                    return this.state;
                }
            }

            class IncrementUseCase extends UseCase {
                execute() {
                    this.dispatch({ type: "increment" });
                }
            }

            class DecrementUseCase extends UseCase {
                execute() {
                    this.dispatch({ type: "decrement" });
                }
            }

            const aStore = new AStore();
            const storeGroup = new StoreGroup({ a: aStore });
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: storeGroup
            });

            const initialState = context.getState();
            assert.ok(initialState.a instanceof AState);
            assert.deepEqual(initialState.a.count, 0);
            return context.useCase(new IncrementUseCase()).execute().then(() => {
                const state = context.getState();
                assert.ok(state.a instanceof AState);
                assert.deepEqual(state.a.count, 1);
            }).then(() => {
                return context.useCase(new DecrementUseCase()).execute();
            }).then(() => {
                const state = context.getState();
                assert.ok(state.a instanceof AState);
                assert.deepEqual(state.a.count, 0);
            });
        });
    });
});
