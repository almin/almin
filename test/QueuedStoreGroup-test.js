// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import Store from "../src/Store";
import QueuedStoreGroup from "../src/UILayer/QueuedStoreGroup";
import createEchoStore from "./helper/EchoStore";
import UseCase from "../src/UseCase";
import Context from "../src/Context";
import Dispatcher from "../src/Dispatcher";
const createAsyncChangeStoreUseCase = (store) => {
    class ChangeTheStoreUseCase extends UseCase {
        execute() {
            return Promise.resolve().then(() => {
                store.emitChange();
            });
        }
    }
    return new ChangeTheStoreUseCase()
};
const createChangeStoreUseCase = (store) => {
    class ChangeTheStoreUseCase extends UseCase {
        execute() {
            store.emitChange();
        }
    }
    return new ChangeTheStoreUseCase()
};
describe("QueuedStoreGroup", function() {
    describe("#onChange", function() {
        context("when StoreGroup#emitChange()", function() {
            context("some store is changed", function() {
                it("should be called by sync", function() {
                    const store = createEchoStore({ name: "AStore" });
                    const storeGroup = new QueuedStoreGroup([store]);
                    let isCalled = false;
                    // then
                    storeGroup.onChange(() => {
                        isCalled = true;
                    });
                    // when
                    store.emitChange();
                    storeGroup.emitChange();
                    assert(isCalled);
                });
            });
            context("any store is not changed", function() {
                it("should be called by sync", function() {
                    const store = createEchoStore({ name: "AStore" });
                    const storeGroup = new QueuedStoreGroup([store]);
                    let isCalled = false;
                    // then
                    storeGroup.onChange(() => {
                        isCalled = true;
                    });
                    // when
                    // But any store is not changed
                    storeGroup.emitChange();
                    assert(isCalled === false);
                });
            });
        });
        context("when UseCase never change any store", function() {
            it("should not be called", function() {
                const store = createEchoStore({ name: "AStore" });
                const storeGroup = new QueuedStoreGroup([store]);
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
        // sync
        context("when SyncUseCase change the store", function() {
            it("should be called by sync", function() {
                const store = createEchoStore({ name: "AStore" });
                const storeGroup = new QueuedStoreGroup([store]);
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
                // sync!!!
                assert(isCalled);
            });
        });
        // async
        context("when ASyncUseCase change the store", function() {
            it("should be called by async", function() {
                const store = createEchoStore({ name: "AStore" });
                const storeGroup = new QueuedStoreGroup([store]);
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
                it("should be called by all usecase", function() {
                    const aStore = createEchoStore({ name: "AStore" });
                    const bStore = createEchoStore({ name: "BStore" });
                    const storeGroup = new QueuedStoreGroup([aStore, bStore], {
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
                                aStore.emitChange();
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
            context("{ asap: false }", function() {
                it("should be called only once", function() {
                    const aStore = createEchoStore({ name: "AStore" });
                    const bStore = createEchoStore({ name: "BStore" });
                    const storeGroup = new QueuedStoreGroup([aStore, bStore]);
                    let onChangeCounter = 0;
                    storeGroup.onChange((changedStores) => {
                        assert.equal(changedStores.length, 2);
                        assert.deepEqual(changedStores, [bStore, aStore]);
                        onChangeCounter += 1;
                    });
                    // when
                    const changeBUseCase = createAsyncChangeStoreUseCase(bStore);
                    class ChangeAAndBUseCase extends UseCase {
                        execute() {
                            return this.context.useCase(changeBUseCase).execute().then(() => {
                                aStore.emitChange();
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
                        assert.equal(onChangeCounter, 1);
                    });
                });
            });
            context("when UseCase#dispatch is called", function() {
                it("should not be called - no changing store", function() {
                    const store = createEchoStore({ name: "AStore" });
                    const storeGroup = new QueuedStoreGroup([store]);
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
                    const store = createEchoStore({ name: "AStore" });
                    const storeGroup = new QueuedStoreGroup([store]);
                    let isCalled = false;
                    storeGroup.onChange(() => {
                        isCalled = true;
                    });
                    // when
                    class DispatchAndFinishAsyncUseCase extends UseCase {
                        execute() {
                            // store is changed
                            store.emitChange();
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
                    const store = createEchoStore({ name: "AStore" });
                    const storeGroup = new QueuedStoreGroup([store]);
                    let calledCount = 0;
                    storeGroup.onChange(() => {
                        calledCount++;
                    });
                    // when
                    class DispatchAndFinishAsyncUseCase extends UseCase {
                        execute() {
                            // 1
                            store.emitChange();
                            this.dispatch({
                                type: "DispatchAndFinishAsyncUseCase"
                            });
                            // 2
                            store.emitChange();
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
        context("when UseCase is failing", function() {
            it("should be called", function() {
                const aStore = createEchoStore({ name: "AStore" });
                const storeGroup = new QueuedStoreGroup([aStore]);
                let onChangeCounter = 0;
                storeGroup.onChange((changedStores) => {
                    assert.equal(changedStores.length, 1);
                    assert.deepEqual(changedStores, [aStore]);
                    onChangeCounter += 1;
                });
                // when
                class FailUseCase extends UseCase {
                    execute() {
                        aStore.emitChange();
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
                const store = createEchoStore({ name: "AStore" });
                const storeGroup = new QueuedStoreGroup([store]);
                let isCalled = false;
                // then
                storeGroup.onChange(() => {
                    isCalled = true;
                });
                // when
                const useCase = new class ThrowErrorUseCase extends UseCase {
                    execute() {
                        store.emitChange();
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
                const aStore = createEchoStore({ name: "AStore" });
                const bStore = createEchoStore({ name: "BStore" });
                const storeGroup = new QueuedStoreGroup([aStore, bStore]);
                class ChangeABUseCase extends UseCase {
                    execute() {
                        aStore.emitChange();
                        aStore.emitChange();
                        bStore.emitChange();
                    }
                }
                const useCase = new ChangeABUseCase();
                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                // then - called change handler a one-time
                storeGroup.onChange((changedStores) => {
                    assert.equal(changedStores.length, 2);
                });
                // when
                return context.useCase(useCase).execute().then(() => {
                    assert.equal(storeGroup.currentChangingStores.length, 2);
                    // then next emit change
                    aStore.emitChange();
                    // reset changing stores
                    assert.equal(storeGroup.currentChangingStores.length, 1);
                });
            });
        });
        context("Sync Change and Async Change in Edge case", function() {
            it("should emit Change twice", function() {
                const store = createEchoStore({ name: "AStore" });
                const storeGroup = new QueuedStoreGroup([store]);
                const asyncUseCase = createAsyncChangeStoreUseCase(store);
                class ChangeTheStoreUseCase extends UseCase {
                    execute() {
                        store.emitChange();
                        this.context.useCase(asyncUseCase).execute(); // 2
                    } // 1
                }
                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                // count
                let changedStoresEachEvent = [];
                storeGroup.onChange((changedStores) => {
                    changedStoresEachEvent.push(changedStores);
                });
                const useCase = new ChangeTheStoreUseCase();
                // when
                return context.useCase(useCase).execute().then(() => {
                    assert.equal(changedStoresEachEvent.length, 2);
                    const [first, second] = changedStoresEachEvent;
                    assert.equal(first.length, 1);
                    assert.equal(second.length, 1);
                });
            });
        });
        context("Flow example", function() {
            it("should output", function() {
                const aStore = createEchoStore({ name: "AStore" });
                const bStore = createEchoStore({ name: "BStore" });
                const cStore = createEchoStore({ name: "CStore" });
                const storeGroup = new QueuedStoreGroup([aStore, bStore, cStore]);
                class ParentUseCase extends UseCase {
                    execute() {
                        const aUseCase = new ChildAUseCase();
                        const bUseCase = new ChildBUseCase();
                        return Promise.all([
                            this.context.useCase(aUseCase).execute(),
                            this.context.useCase(bUseCase).execute()
                        ]).then(() => {
                            // change cStore at same time
                            this.dispatch({
                                type: "END"
                            });
                        });
                    }
                }
                class ChildAUseCase extends UseCase {
                    execute() {
                        return new Promise((resolve) => {
                            aStore.emitChange();
                            resolve();
                        });
                    }
                }
                class ChildBUseCase extends UseCase {
                    execute() {
                        return new Promise((resolve) => {
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
                // C is changed
                useCase.onDispatch(payload => {
                    if (payload.type === "END") {
                        cStore.emitChange();
                    }
                });
                // then - called change handler a one-time
                let changed = [];
                storeGroup.onChange((changedStores) => {
                    changed = changed.concat(changedStores);
                });
                // when
                return context.useCase(useCase).execute().then(() => {
                    assert.equal(changed.length, 3);
                    assert.deepEqual(changed, [
                        aStore,
                        bStore,
                        cStore
                    ]);
                });
            });
        })

    });
    describe("#getState", function() {
        it("should return a single state object", function() {
            class AStore extends Store {
                getState() {
                    return { a: "a value" };
                }
            }
            class BStore extends Store {
                getState() {
                    return { b: "b value" };
                }
            }
            const aStore = new AStore();
            const bStore = new BStore();
            const storeGroup = new QueuedStoreGroup([aStore, bStore]);
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
                        return {
                            aState: new AState()
                        };
                    }
                }
                class BState {
                }
                class BStore extends Store {
                    getState() {
                        return {
                            bState: new BState()
                        };
                    }
                }
                const aStore = new AStore();
                const bStore = new BStore();
                const storeGroup = new QueuedStoreGroup([aStore, bStore]);
                // when - a,b emit change at same time
                const state = storeGroup.getState();
                // then - return a single state object that contain each store and merge
                const keys = Object.keys(state);
                assert(keys.indexOf("aState") !== -1);
                assert(state["aState"] instanceof AState);
                assert(state["bState"] instanceof BState);
            });
        });
    });
    describe("#release", function() {
        it("release onChange handler", function() {
            const aStore = createEchoStore({ name: "AStore" });
            const bStore = createEchoStore({ name: "BStore" });
            const storeGroup = new QueuedStoreGroup([aStore, bStore]);
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
});