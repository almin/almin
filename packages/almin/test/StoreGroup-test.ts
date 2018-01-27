// LICENSE : MIT
"use strict";
import { UseCaseFunction } from "../src/FunctionalUseCaseContext";
import * as assert from "assert";
import { CompletedPayload, Context, DidExecutedPayload, Dispatcher, Payload, Store, StoreGroup, UseCase } from "../src";
import { InitializedPayload } from "../src/payload/InitializedPayload";
import { createStore, MockStore } from "./helper/create-new-store";
import { SinonStub } from "sinon";

const sinon = require("sinon");

const createAsyncChangeStoreUseCase = (store: MockStore) => {
    class ChangeTheStoreUseCase extends UseCase {
        execute() {
            return Promise.resolve().then(() => {
                const newState = { a: {} };
                store.mutableStateWithoutEmit(newState);
            });
        }
    }

    return new ChangeTheStoreUseCase();
};
const createChangeStoreUseCase = (store: MockStore) => {
    class ChangeTheStoreUseCase extends UseCase {
        execute() {
            const newState = { a: {} };
            store.mutableStateWithoutEmit(newState);
        }
    }

    return new ChangeTheStoreUseCase();
};
describe("StoreGroup", function() {
    describe("constructor(map)", () => {
        it("throw error when invalid arguments", () => {
            assert.throws(() => {
                // @ts-ignore
                new StoreGroup(null);
            });
            assert.throws(() => {
                // @ts-ignore
                new StoreGroup();
            });
            assert.throws(() => {
                new StoreGroup([]);
            });
            assert.throws(() => {
                new StoreGroup({
                    a: 1,
                    b: 2
                });
            });
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
        describe("when any store is not changed", function() {
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
                assert.ok(isCalled === false);
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
                assert.ok(isCalled);
            });
        });
        describe("when UseCase never change any store", function() {
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
                }();
                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                return context
                    .useCase(useCase)
                    .execute()
                    .then(() => {
                        assert.ok(isCalled === false);
                    });
            });
        });
        describe("onChange(changingStores)", () => {
            it("should changingStores are changed own state", () => {
                const storeA = createStore({ name: "AStore" });
                const storeB = createStore({ name: "BStore" });
                const storeGroup = new StoreGroup({
                    AStore: storeA,
                    BStore: storeB
                });
                let changedStores: Store[] = [];
                storeGroup.onChange(changingStores => {
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
                return context
                    .useCase(useCase)
                    .execute()
                    .then(() => {
                        assert.equal(changedStores.length, 2);
                        // no specify in order
                        assert.deepEqual(changedStores.sort(), [storeA, storeB].sort());
                    });
            });
        });
        // sync
        describe("when SyncUseCase change the store", function() {
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
                assert.ok(isCalled);
            });
        });
        // async
        describe("when ASyncUseCase change the store", function() {
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
                const promise = context
                    .useCase(asyncUseCase)
                    .execute()
                    .then(() => {
                        assert.ok(isCalled, "after");
                    });
                // not yet change
                assert.strictEqual(isCalled, false, "before");
                return promise;
            });
        });
        describe("when UseCase is nesting", function() {
            it("should be called by all UseCases", function() {
                const aStore = createStore({ name: "AStore" });
                const bStore = createStore({ name: "BStore" });
                const storeGroup = new StoreGroup({ a: aStore, b: bStore });
                let onChangeCounter = 0;
                storeGroup.onChange(() => {
                    onChangeCounter += 1;
                });
                // when
                const changeBUseCase = createAsyncChangeStoreUseCase(bStore);

                class ChangeAAndBUseCase extends UseCase {
                    execute() {
                        return this.context
                            .useCase(changeBUseCase)
                            .execute()
                            .then(() => {
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
                return context
                    .useCase(useCase)
                    .execute()
                    .then(() => {
                        assert.equal(onChangeCounter, 2);
                    });
            });
            describe("when UseCase#dispatch is called", function() {
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
                            return new Promise(resolve => {
                                setTimeout(resolve, 100);
                            });
                        }
                    }

                    const context = new Context({
                        dispatcher: new Dispatcher(),
                        store: storeGroup
                    });
                    context.events.onDispatch(payload => {
                        dispatchedPayload = payload;
                    });
                    // when
                    const useCase = new DispatchAndFinishAsyncUseCase();
                    const resultPromise = context.useCase(useCase).execute();
                    // then - should not be changed, but it is dispatched
                    assert.ok(isChanged === false);
                    assert.deepEqual(dispatchedPayload, {
                        type: "DispatchAndFinishAsyncUseCase"
                    });
                    return resultPromise;
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
                            return new Promise(resolve => {
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
                    assert.ok(isCalled);
                    return resultPromise;
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
                    return context
                        .useCase(useCase)
                        .execute()
                        .then(() => {
                            assert.equal(calledCount, 2);
                        });
                });
            });
        });
        describe("when UseCase throwing Error", function() {
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
                return context
                    .useCase(useCase)
                    .execute()
                    .catch(() => {
                        assert.equal(onChangeCounter, 1);
                    });
            });
        });
        describe("when UseCase call `throwError()", function() {
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
                }();
                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                return context
                    .useCase(useCase)
                    .execute()
                    .then(() => {
                        assert.ok(isCalled);
                    });
            });
        });
        describe("WhiteBox testing", function() {
            it("should thin out change events at once", function() {
                const aStore = createStore({ name: "AStore" });
                const bStore = createStore({ name: "BStore" });
                const storeGroup = new StoreGroup({ a: aStore, b: bStore });

                class ChangeABUseCase extends UseCase {
                    execute() {
                        aStore.mutableStateWithoutEmit({ a: 1 });
                        aStore.emitChange(); // *1
                        bStore.mutableStateWithoutEmit({ b: 1 });
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
                storeGroup.onChange(changedStores => {
                    calledCount++;
                    assert.equal(changedStores.length, 2);
                });
                // when
                return context
                    .useCase(useCase)
                    .execute()
                    .then(() => {
                        // collect up *1 and *2
                        // Store#onChange in StoreGroup only add changing queue.
                        assert.equal(calledCount, 1, "onChange is called just once");
                    });
            });
            describe("when the UseCase don't return a promise", () => {
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
                    return context
                        .useCase(useCase)
                        .execute()
                        .then(() => {
                            assert.equal(calledCount, 1, "StoreGroup#emitChange is called just once");
                        });
                });
            });
        });
        describe("Sync Change and Async Change in Edge case", function() {
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
                return context
                    .useCase(useCase)
                    .execute()
                    .then(() => {
                        assert.equal(calledCount, 2);
                    });
            });
        });
        describe("onChange calling flow example", function() {
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
                        });
                    }
                }

                class ChildAUseCase extends UseCase {
                    execute() {
                        return new Promise(resolve => {
                            aStore.updateState({ a: 1 });
                            resolve();
                        });
                    }
                }

                class ChildBUseCase extends UseCase {
                    execute() {
                        return new Promise(resolve => {
                            bStore.updateState({ b: 1 });
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
                let actualChangedStores: Store[] = [];
                storeGroup.onChange(changedStores => {
                    actualChangedStores = actualChangedStores.concat(changedStores);
                });
                // when
                return context
                    .useCase(useCase)
                    .execute()
                    .then(() => {
                        assert.equal(actualChangedStores.length, 3);
                        assert.deepEqual(actualChangedStores, [aStore, bStore, cStore]);
                    });
            });
        });
        describe("When StoreGroup calling Store#receivePayload", function() {
            it("should call count is necessary and sufficient for performance", function() {
                class AStore extends Store<any> {
                    public receivedPayloadList: any[];

                    constructor() {
                        super();
                        this.state = {};
                        this.receivedPayloadList = [];
                    }

                    receivePayload(payload: any) {
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
                    type = "test";
                }

                const useCaseSync: UseCaseFunction = ({ dispatcher }) => {
                    return () => {
                        dispatcher.dispatch(new ExamplePayload());
                    };
                };
                const useCaseAsync: UseCaseFunction = ({ dispatcher }) => {
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
                    // CompletedPayload is not called because sync useCase is already finished,
                    // Async UseCase,
                    ExamplePayload,
                    DidExecutedPayload,
                    CompletedPayload
                ];
                // then
                return context
                    .useCase(useCaseSync)
                    .execute()
                    .then(() => {
                        return context.useCase(useCaseAsync).execute();
                    })
                    .then(() => {
                        assert.strictEqual(
                            aStore.receivedPayloadList.length,
                            expectedReceivedPayloadList.length,
                            "should be equal receive payload length"
                        );
                        aStore.receivedPayloadList.forEach((payload, index) => {
                            const ExpectedPayloadClass = expectedReceivedPayloadList[index];
                            assert.ok(
                                payload instanceof ExpectedPayloadClass,
                                `${payload.type} instanceof ${ExpectedPayloadClass}`
                            );
                        });
                    });
            });
        });
        describe("when Store#emitChange before receivePayload", function() {
            it("arguments includes the store", function() {
                const aStore = createStore({ name: "AStore" });
                const storeGroup = new StoreGroup({ a: aStore });
                let actualStores: Store[] = [];
                storeGroup.onChange(stores => {
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
                    };
                };
                // then
                return context
                    .useCase(useCase)
                    .execute()
                    .then(() => {
                        assert.deepEqual(actualStores, [aStore]);
                    });
            });
        });
        describe("when Store is changed in receivePayload", function() {
            it("arguments includes the store", function() {
                class AStore extends Store {
                    constructor() {
                        super();
                        this.state = { key: "initial" };
                    }

                    receivePayload(payload: any) {
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
                let actualStores: Store[] = [];
                storeGroup.onChange(stores => {
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
                return context
                    .useCase(useCase)
                    .execute()
                    .then(() => {
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
        describe("when getState() return State object", function() {
            it("should return a single state has {<key>: state} of return Store#getState", function() {
                class AState {}

                class AStore extends Store {
                    getState() {
                        return new AState();
                    }
                }

                class BState {}

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
                assert.ok(keys.indexOf("a") !== -1);
                assert.ok(state["a"] instanceof AState);
                assert.ok(state["b"] instanceof BState);
            });
        });
    });
    describe("Warning", () => {
        let consoleErrorStub: SinonStub;
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
            return context
                .useCase(new EmitStoreUseCase())
                .execute()
                .then(() => {
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
            return context
                .useCase(new TransactionUseCase())
                .execute()
                .then(() => {
                    return context.useCase(new TransactionUseCase()).execute();
                })
                .then(() => {
                    assert.equal(
                        consoleErrorStub.callCount,
                        0,
                        `This does call emitChange() warning should not be called.
init -> next -> init in a execution of UseCase should be valid.
Something wrong implementation of calling Store#emitChange at multiple`
                    );
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
            const useCase: UseCaseFunction = () => {
                return () => {
                    // reference is change but shall-equal return false
                    store.state = {
                        a: "value"
                    };
                };
            };
            return context
                .useCase(useCase)
                .execute()
                .then(() => {
                    assert.ok(consoleErrorStub.calledOnce);
                });
        });
        describe("when strict mode", () => {
            it("should not show warning if update store inside of receivePayload", function() {
                class AStore extends Store {
                    constructor() {
                        super();
                        this.state = {
                            a: "value"
                        };
                    }

                    // Good: Update this store inside of receivePayload
                    receivePayload(payload: any) {
                        if (payload.type === "UPDATE_A") {
                            this.setState(payload.body);
                        }
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
                    store: storeGroup,
                    options: {
                        strict: true
                    }
                });
                const updateAStoreUseCase: UseCaseFunction = ({ dispatcher }) => {
                    return () => {
                        dispatcher.dispatch({
                            type: "UPDATE_A",
                            body: "new value"
                        });
                    };
                };
                return context
                    .useCase(updateAStoreUseCase)
                    .execute()
                    .then(() => {
                        assert.strictEqual(consoleErrorStub.callCount, 0);
                    });
            });
            it("should show warning if update store outside of receivePayload", function() {
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
                    store: storeGroup,
                    options: {
                        strict: true
                    }
                });
                const updateAStoreUseCase: UseCaseFunction = () => {
                    return () => {
                        // Bad: update state outside of receivePayload
                        store.setState({
                            a: "new value"
                        });
                    };
                };
                return context
                    .useCase(updateAStoreUseCase)
                    .execute()
                    .then(() => {
                        assert.strictEqual(consoleErrorStub.callCount, 1, "should not update state in a UseCase");
                    });
            });
        });
        describe("Not support warning case", () => {
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
                const useCase: UseCaseFunction = () => {
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
                return context
                    .useCase(useCase)
                    .execute()
                    .then(() => {
                        assert.equal(consoleErrorStub.callCount, 0, "Can't support this case");
                    });
            });
        });
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
            assert.ok(!isCalled);
        });
    });
    describe("#receivePayload", () => {
        it("UseCase dispatch payload -> Store should receive it", () => {
            class AState {
                private count: number;

                constructor(count: number) {
                    this.count = count;
                }

                reduce(payload: any) {
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
                receivePayload(payload: any) {
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
            return context
                .useCase(new IncrementUseCase())
                .execute()
                .then(() => {
                    const state = context.getState();
                    assert.ok(state.a instanceof AState);
                    assert.deepEqual(state.a.count, 1);
                })
                .then(() => {
                    return context.useCase(new DecrementUseCase()).execute();
                })
                .then(() => {
                    const state = context.getState();
                    assert.ok(state.a instanceof AState);
                    assert.deepEqual(state.a.count, 0);
                });
        });
    });
});
