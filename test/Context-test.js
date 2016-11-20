// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import Context from "../src/Context";
import Dispatcher from "../src/Dispatcher";
import Store from "../src/Store";
import UseCase from "../src/UseCase";
import UseCaseExecutor from "../src/UseCaseExecutor";
import StoreGroup from "../src/UILayer/StoreGroup";
import createEchoStore from "./helper/EchoStore";
class TestUseCase extends UseCase {
    execute() {

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
describe("Context", function() {
    describe("dispatch in UseCase", function() {
        it("should dispatch Store", function(done) {
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
                        if (payload.type === DISPATCHED_EVENT.type) {
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
    describe("#getStates", function() {
        it("should get a single state from State", function() {
            const dispatcher = new Dispatcher();
            const expectedMergedObject = {
                "1": 1
            };
            const store = createEchoStore({ echo: { "1": 1 } });
            const appContext = new Context({
                dispatcher,
                store
            });
            const states = appContext.getState();
            assert.deepEqual(states, expectedMergedObject);
        });
    });
    describe("#onChange", function() {
        it("should called when change some State", function(done) {
            const dispatcher = new Dispatcher();
            const testStore = createEchoStore({ echo: { "1": 1 } });
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
        it("should thin change events are happened at same time", function(done) {
            const dispatcher = new Dispatcher();
            const aStore = createEchoStore({ name: "AStore", echo: { "1": 1 } });
            const bStore = createEchoStore({ name: "BStore", echo: { "1": 1 } });
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
    describe("#onWillExecuteEachUseCase", function() {
        it("should called before UseCase will execute", function(done) {
            const dispatcher = new Dispatcher();
            const appContext = new Context({
                dispatcher,
                store: new Store()
            });
            const testUseCase = new TestUseCase();
            // then
            appContext.onWillExecuteEachUseCase((payload, meta) => {
                assert.equal(meta.useCase, testUseCase);
                done();
            });
            // when
            appContext.useCase(testUseCase).execute();
        });
    });
    describe("#onDispatch", function() {
        it("should called the other of built-in event", function(done) {
            const dispatcher = new Dispatcher();
            const appContext = new Context({
                dispatcher,
                store: new Store()
            });
            const expectedPayload = {
                type: "event"
            };
            class EventUseCase extends UseCase {
                execute() {
                    this.dispatch(expectedPayload);
                }
            }
            const eventUseCase = new EventUseCase();
            // then
            appContext.onWillExecuteEachUseCase((payload, meta) => {
                assert.equal(meta.useCase, eventUseCase);
            });
            // onDispatch should not called when UseCase will/did execute.
            appContext.onDispatch(payload => {
                assert.equal(payload, expectedPayload);
            });
            appContext.onDidExecuteEachUseCase((payload, meta) => {
                assert.equal(meta.useCase, eventUseCase);
                done();
            });
            // when
            appContext.useCase(eventUseCase).execute();
        });
    });
    describe("#onDidExecuteEachUseCase", function() {
        it("should called after UseCase did execute", function(done) {
            const dispatcher = new Dispatcher();
            const appContext = new Context({
                dispatcher,
                store: new Store()
            });
            const testUseCase = new TestUseCase();
            // then
            appContext.onDidExecuteEachUseCase((payload, meta) => {
                assert.equal(meta.useCase, testUseCase);
                done();
            });
            // when
            appContext.useCase(testUseCase).execute();
        });
    });
    describe("#onError", function() {
        it("should called after UseCase did execute", function(done) {
            const dispatcher = new Dispatcher();
            const appContext = new Context({
                dispatcher,
                store: new Store()
            });
            const throwUseCase = new ThrowUseCase();
            // then
            appContext.onErrorDispatch((payload, meta) => {
                assert(payload.error instanceof Error);
                assert.equal(meta.useCase, throwUseCase);
                done();
            });
            // when
            appContext.useCase(throwUseCase).execute();
        });
    });
    describe("#useCase", function() {
        it("should return UseCaseExecutor", function() {
            const dispatcher = new Dispatcher();
            const appContext = new Context({
                dispatcher,
                store: createEchoStore({ echo: { "1": 1 } })
            });
            const useCaseExecutor = appContext.useCase(new ThrowUseCase());
            assert(useCaseExecutor instanceof UseCaseExecutor);
            useCaseExecutor.execute();
        });
    });
});
