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
            it("should be called by sync", function() {
                const store = createEchoStore({name: "AStore"});
                const storeGroup = new QueuedStoreGroup([store]);
                let isCalled = false;
                // then
                storeGroup.onChange(() => {
                    isCalled = true;
                });
                // when
                storeGroup.emitChange();
                assert(isCalled);
            });
        });
        context("when UseCase never change any store", function() {
            it("should not be called", function() {
                const store = createEchoStore({name: "AStore"});
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
                const store = createEchoStore({name: "AStore"});
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
                const store = createEchoStore({name: "AStore"});
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
                    assert(isCalled);
                });
                // not yet change
                assert(isCalled === false);
                return promise
            });
        });
        context("when UseCase is nesting", function() {
            context("{ asap: true }", function() {
                it("should be called by all usecase", function() {
                    const aStore = createEchoStore({name: "AStore"});
                    const bStore = createEchoStore({name: "BStore"});
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
                    const aStore = createEchoStore({name: "AStore"});
                    const bStore = createEchoStore({name: "BStore"});
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
                it("should be called by sync", function() {
                    const store = createEchoStore({name: "AStore"});
                    const storeGroup = new QueuedStoreGroup([store]);
                    let isCalled = false;
                    storeGroup.onChange(() => {
                        isCalled = true;
                    });
                    // when
                    class DispatchAndFinishAsyncUseCase extends UseCase {
                        execute() {
                            this.dispatch({
                                type: "DispatchAndFinishAsyncUseCase"
                            });
                            return new Promise((resolve) => {
                                setTimeout(resolve, 1000);
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
            });
        });
        context("when UseCase is failing", function() {
            it("should be called", function() {
                const aStore = createEchoStore({name: "AStore"});
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
        context("WhiteBox testing", function() {
            it("should thin out change events at once", function() {
                const aStore = createEchoStore({name: "AStore"});
                const bStore = createEchoStore({name: "BStore"});
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
        })
    });
    describe("#getState", function() {
        it("should return a single state object", function() {
            class AStore extends Store {
                getState() {
                    return {a: "a value"};
                }
            }
            class BStore extends Store {
                getState() {
                    return {b: "b value"};
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

        context("when a store emit change", function() {
            it("should returned state replace with new getState() result", function() {
                let aCalledCount = 0;
                let bCalledCount = 0;
                class AState {
                    constructor({count}) {
                        this.count = count;
                    }
                }
                // then - emitChange => countup
                class AStore extends Store {
                    getState() {
                        aCalledCount = aCalledCount + 1;
                        return {
                            AState: new AState({count: aCalledCount})
                        }
                    }
                }
                class BState {
                    constructor({count}) {
                        this.count = count;
                    }
                }
                class BStore extends Store {
                    getState() {
                        bCalledCount = bCalledCount + 1;
                        return {
                            BState: new BState({count: bCalledCount})
                        };
                    }
                }
                const aStore = new AStore();
                const bStore = new BStore();
                const storeGroup = new QueuedStoreGroup([aStore, bStore]);
                assert.equal(storeGroup.getState()["AState"].count, 1);
                assert.equal(storeGroup.getState()["BState"].count, 1);
                assert.equal(storeGroup.getState()["AState"].count, 1);
                assert.equal(storeGroup.getState()["BState"].count, 1);
                // when
                const useCase = createChangeStoreUseCase(aStore);
                const context = new Context({
                    dispatcher: new Dispatcher(),
                    store: storeGroup
                });
                return context.useCase(useCase).execute().then(() => {
                    assert.equal(storeGroup.getState()["AState"].count, 2);
                    assert.equal(storeGroup.getState()["BState"].count, 1);
                });
            });
        });
    });
    describe("#release", function() {
        it("release onChange handler", function() {
            const aStore = createEchoStore({name: "AStore"});
            const bStore = createEchoStore({name: "BStore"});
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