// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import { Store } from "../lib/Store";
import { CQRSStoreGroup } from "../lib/UILayer/CQRSStoreGroup";
import { createStore } from "./helper/create-store";
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
    return new ChangeTheStoreUseCase()
};
describe("CQRSStoreGroup", function() {
    describe("#emitChange", function() {
        context("when any store is not changed", function() {
            it("should not call onChange", function() {
                const store = createStore({ name: "AStore" });
                const storeGroup = new CQRSStoreGroup([store]);
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
                const storeGroup = new CQRSStoreGroup([store]);
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
                const storeGroup = new CQRSStoreGroup([store]);
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
                const store = createStore({ name: "AStore" });
                const storeGroup = new CQRSStoreGroup([store]);
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
                const store = createStore({ name: "AStore" });
                const storeGroup = new CQRSStoreGroup([store]);
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
                    const storeGroup = new CQRSStoreGroup([aStore, bStore], {
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
                    const storeGroup = new CQRSStoreGroup([store]);
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
                    const storeGroup = new CQRSStoreGroup([store]);
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
                    const storeGroup = new CQRSStoreGroup([store]);
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
                const storeGroup = new CQRSStoreGroup([aStore]);
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
                const storeGroup = new CQRSStoreGroup([store]);
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
                const storeGroup = new CQRSStoreGroup([aStore, bStore]);
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
                    const storeGroup = new CQRSStoreGroup([aStore]);
                    class ChangeABUseCase extends UseCase {
                        execute() {
                            aStore.updateState({ a: 1 });
                        }
                    }
                    const useCase = new ChangeABUseCase();
                    const context = new Context({
                        dispatcher: new Dispatcher(),
                        store: storeGroup
                    });
                    // then - called change handler a one-time
                    let calledCount = 0;
                    storeGroup.emitChange = () => {
                        calledCount++;
                    };
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
                const storeGroup = new CQRSStoreGroup([store]);
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
                const storeGroup = new CQRSStoreGroup([aStore, bStore, cStore]);
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
            const storeGroup = new CQRSStoreGroup([aStore, bStore]);
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
                const storeGroup = new CQRSStoreGroup([aStore, bStore]);
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
            const aStore = createStore({ name: "AStore" });
            const bStore = createStore({ name: "BStore" });
            const storeGroup = new CQRSStoreGroup([aStore, bStore]);
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
