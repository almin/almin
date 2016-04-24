// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import Context from "../src/Context";
import Dispatcher from "../src/Dispatcher";
import Store from "../src/Store";
import UseCase from "../src/UseCase";
import UseCaseExecutor from "../src/UseCaseExecutor";
import StoreGroup from "../src/UILayer/StoreGroup";
class TestStore extends Store {
    constructor(echo) {
        super();
        this.echo = echo;
    }

    getState() {
        return this.echo;
    }
}

class ThrowUseCase extends UseCase {
    execute() {
        this.dispatch({
            type: "update",
            value: "value"
        });
        this.throwError(new Error("test"));
    }
}
describe("Context", function () {
    describe("dispatch in UseCase", function () {
        it("should dispatch Store", function (done) {
            const dispatcher = new Dispatcher();
            const DISPATCHED_EVENT = {
                type: "update",
                value: "value"
            };
            // then
            class DispatchUseCase extends UseCase {
                execute() {
                    this.dispatch(DISPATCHED_EVENT);
                }
            }
            class ReceiveStore extends Store {
                constructor() {
                    super();
                    this.onDispatch(payload => {
                        if(payload.type === DISPATCHED_EVENT.type) {
                            assert.deepEqual(payload, DISPATCHED_EVENT);
                            done();
                        }
                    });
                }
            }
            // when
            const store = new ReceiveStore();
            const appContext = new Context({
                dispatcher,
                store
            });
            appContext.useCase(new DispatchUseCase()).execute();
        });
    });
    describe("#getStates", function () {
        it("should get a single state from State", function () {
            const dispatcher = new Dispatcher();
            const expectedMergedObject = {
                "1": 1
            };
            const store = new TestStore({"1": 1});
            const appContext = new Context({
                dispatcher,
                store
            });
            const states = appContext.getState();
            assert.deepEqual(states, expectedMergedObject);
        });
    });
    describe("#onChange", function () {
        it("should called when change some State", function (done) {
            const dispatcher = new Dispatcher();
            const testStore = new TestStore({"1": 1});
            const storeGroup = new StoreGroup([testStore]);
            const appContext = new Context({
                dispatcher,
                store: storeGroup
            });
            appContext.onChange((stores) => {
                assert.equal(stores.length, 1);
                assert(stores[0] === testStore);
                done();
            });
            testStore.emitChange();
        });
        it("should thin change events are happened at same time", function (done) {
            const dispatcher = new Dispatcher();
            const aStore = new TestStore({"1": 1});
            const bStore = new TestStore({"1": 1});
            const storeGroup = new StoreGroup([aStore, bStore]);
            const appContext = new Context({
                dispatcher,
                store: storeGroup
            });
            appContext.onChange((stores) => {
                assert(stores.length, 2);
                done();
            });
            // multiple change event at same time.
            aStore.emitChange();
            bStore.emitChange();
        });
    });
    describe("#useCase", function () {
        it("should return UseCaseExecutor", function () {
            const dispatcher = new Dispatcher();
            const appContext = new Context({
                dispatcher,
                store: new TestStore({"1": 1})
            });
            const useCaseExecutor = appContext.useCase(new ThrowUseCase());
            assert(useCaseExecutor instanceof UseCaseExecutor);
            useCaseExecutor.execute();
        });
    });
});
