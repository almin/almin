// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import Store from "../src/Store";
import StoreGroup from "../src/UILayer/StoreGroup";
import createEchoStore from "./helper/EchoStore";

describe("StoreGroup", function () {
    describe("#onChange", function () {
        it("should async called onChange ", function (done) {
            const aStore = createEchoStore({name: "AStore"});
            const bStore = createEchoStore({name: "BStore"});
            const storeGroup = new StoreGroup([aStore, bStore]);
            // when - a,b emit change at same time
            aStore.emitChange();
            bStore.emitChange();
            // Should be failure, if emit -> onChange **sync**.
            // But it is called async
            // then - called change handler a one-time
            storeGroup.onChange((changedStores) => {
                assert.equal(changedStores.length, 2);
                done();
            });
        });
        it("should thin out change events at once", function (done) {
            const aStore = createEchoStore({name: "AStore"});
            const bStore = createEchoStore({name: "BStore"});
            const storeGroup = new StoreGroup([aStore, bStore]);
            // then - called change handler a one-time
            storeGroup.onChange((changedStores) => {
                assert.equal(changedStores.length, 2);
                done();
            });
            // when - a,b emit change at same time
            aStore.emitChange();
            aStore.emitChange();
            bStore.emitChange();
        });
    });
    describe("#getState", function () {
        it("should return a single state object", function () {
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
            const storeGroup = new StoreGroup([aStore, bStore]);
            // when - a,b emit change at same time
            const state = storeGroup.getState();
            // then - return a single state object that contain each store and merge
            assert.deepEqual(state, {
                a: "a value",
                b: "b value"
            });
        });
        context("when getState() return State object", function () {
            it("should return a single state has [State.name] as a key", function () {
                class AState {
                }
                class AStore extends Store {
                    getState() {
                        return {
                            AState: new AState()
                        };
                    }
                }
                class BState {
                }
                class BStore extends Store {
                    getState() {
                        return {
                            BState: new BState()
                        };
                    }
                }
                const aStore = new AStore();
                const bStore = new BStore();
                const storeGroup = new StoreGroup([aStore, bStore]);
                // when - a,b emit change at same time
                const state = storeGroup.getState();
                // then - return a single state object that contain each store and merge
                const keys = Object.keys(state);
                assert(keys.indexOf(AState.name) !== -1);
                assert(keys.indexOf(AState.name) !== -1);
                assert(state[AState.name] instanceof AState);
                assert(state[BState.name] instanceof BState);
            });
        });

        context("when a store emit change", function () {
            it("should returned state replace with new getState() result", function (done) {
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
                const storeGroup = new StoreGroup([aStore, bStore]);
                assert.equal(storeGroup.getState()["AState"].count, 1);
                assert.equal(storeGroup.getState()["BState"].count, 1);
                assert.equal(storeGroup.getState()["AState"].count, 1);
                assert.equal(storeGroup.getState()["BState"].count, 1);
                // when - a,b emit change at same time
                storeGroup.onChange(() => {
                    assert.equal(storeGroup.getState()["AState"].count, 2);
                    assert.equal(storeGroup.getState()["BState"].count, 1);
                    done();
                });
                // then - only change AState
                aStore.emitChange();
            });
        });
    });
});