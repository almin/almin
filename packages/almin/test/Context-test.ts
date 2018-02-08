// LICENSE : MIT
"use strict";
import * as assert from "assert";
import {
    CompletedPayload,
    Context,
    DidExecutedPayload,
    DispatchedPayload,
    Dispatcher,
    DispatcherPayloadMeta,
    Store,
    StoreGroup,
    UseCase,
    WillExecutedPayload
} from "../src";
import { UseCaseExecutorImpl } from "../src/UseCaseExecutor";
import { createStore } from "./helper/create-new-store";
import { createEchoStore } from "./helper/EchoStore";
import { DispatchUseCase } from "./use-case/DispatchUseCase";
import { ParentUseCase } from "./use-case/NestingUseCase";
import { NotExecuteUseCase } from "./use-case/NotExecuteUseCase";
import { SinonStub } from "sinon";
import { UseCaseFunction } from "../src/FunctionalUseCaseContext";
import { createUpdatableStoreWithUseCase } from "./helper/create-update-store-usecase";

const sinon = require("sinon");

// payload

class TestUseCase extends UseCase {
    execute() {}
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
    context("Deprecated API", () => {
        let consoleErrorStub: SinonStub;
        beforeEach(() => {
            consoleErrorStub = sinon.stub(console, "warn");
        });
        afterEach(() => {
            consoleErrorStub.restore();
        });
        it("should be deprecated warn", function() {
            const aStore = createStore({ name: "test" });
            const storeGroup = new StoreGroup({ a: aStore });
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: storeGroup
            });

            context.onCompleteEachUseCase(() => {});
            assert.strictEqual(consoleErrorStub.callCount, 1, "should be deprecated");
        });
    });
    describe("UseCase can dispatch in Context", function() {
        it("should dispatch Store", function() {
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

            const dispatchedPayload: [DispatchedPayload, DispatcherPayloadMeta][] = [];

            class ReceiveStore extends Store {
                constructor() {
                    super();
                    this.onDispatch((payload, meta) => {
                        if (payload.type === DISPATCHED_EVENT.type) {
                            dispatchedPayload.push([payload, meta]);
                        }
                    });
                }

                getState() {
                    return {};
                }
            }

            // when
            const store = new ReceiveStore();
            const appContext = new Context({
                dispatcher,
                store
            });
            const useCase = new DispatchUseCase();
            return appContext
                .useCase(useCase)
                .execute()
                .then(() => {
                    const [payload, meta] = dispatchedPayload[0];
                    assert.deepEqual(payload, DISPATCHED_EVENT);
                    assert.strictEqual(meta.useCase, useCase);
                    assert.strictEqual(meta.isTrusted, false);
                    assert.strictEqual(meta.parentUseCase, null);
                    assert.strictEqual(typeof meta.timeStamp, "number");
                });
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
            const aStore = createStore({ name: "AStore" });
            const storeGroup = new StoreGroup({
                a: aStore
            });
            const appContext = new Context({
                dispatcher,
                store: storeGroup
            });
            appContext.onChange(stores => {
                assert.equal(stores.length, 1);
                assert.equal(stores[0], aStore);
                done();
            });
            aStore.updateState({ a: 1 });
        });
        it("should thin change events are happened at same time", function(done) {
            const dispatcher = new Dispatcher();
            const aStore = createStore({ name: "AStore" });
            const bStore = createStore({ name: "BStore" });
            const storeGroup = new StoreGroup({
                a: aStore,
                b: bStore
            });
            const appContext = new Context({
                dispatcher,
                store: storeGroup
            });
            appContext.onChange(stores => {
                assert.equal(stores.length, 2);
                done();
            });
            // catch multiple changes at one time
            aStore.mutableStateWithoutEmit({ a: 1 });
            bStore.mutableStateWithoutEmit({ b: 1 });
            storeGroup.emitChange();
        });
    });
    describe("#onWillNotExecuteEachUseCase", () => {
        it("should be called when UseCase#shouldExecute() return false", done => {
            const dispatcher = new Dispatcher();
            const appContext = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const notExecuteUseCase = new NotExecuteUseCase();
            // then
            appContext.events.onWillNotExecuteEachUseCase((payload, meta) => {
                assert.ok(Array.isArray(payload.args));
                assert.ok(typeof meta.timeStamp === "number");
                assert.equal(meta.useCase, notExecuteUseCase);
                assert.equal(meta.parentUseCase, null);
                assert.equal(meta.isUseCaseFinished, true);
                done();
            });
            // when
            appContext.useCase(notExecuteUseCase).execute();
        });
    });
    describe("#onWillExecuteEachUseCase", function() {
        it("should not called onWillNotExecuteEachUseCase", function() {
            const dispatcher = new Dispatcher();
            const appContext = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const testUseCase = new TestUseCase();
            // then
            let isOnWillNotExecuteEachUseCaseCalled = false;
            appContext.events.onWillNotExecuteEachUseCase(() => {
                isOnWillNotExecuteEachUseCaseCalled = true;
            });
            // when
            return appContext
                .useCase(testUseCase)
                .execute()
                .then(() => {
                    assert.ok(!isOnWillNotExecuteEachUseCaseCalled, "onWillNotExecuteEachUseCase should not called");
                });
        });
        it("should called before UseCase will execute", function(done) {
            const dispatcher = new Dispatcher();
            const appContext = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const testUseCase = new TestUseCase();
            // then
            appContext.events.onWillExecuteEachUseCase((payload, meta) => {
                assert.ok(Array.isArray(payload.args));
                assert.ok(typeof meta.timeStamp === "number");
                assert.equal(meta.useCase, testUseCase);
                assert.equal(meta.parentUseCase, null);
                done();
            });
            // when
            appContext.useCase(testUseCase).execute();
        });
        it("payload.args is the same with context.execute arguments", function(done) {
            const dispatcher = new Dispatcher();
            const appContext = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const testUseCase = new TestUseCase();
            const expectedArguments = "param";
            // then
            appContext.events.onWillExecuteEachUseCase((payload, _meta) => {
                assert.ok(payload.args.length === 1);
                const [arg] = payload.args;
                assert.ok(arg === expectedArguments);
                done();
            });
            // when
            appContext.useCase(testUseCase).execute(expectedArguments);
        });
    });
    describe("#onDispatch", function() {
        it("should called the other of built-in event", function() {
            const dispatcher = new Dispatcher();
            const appContext = new Context({
                dispatcher,
                store: createStore({ name: "test" })
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
            const isCalled: { [index: string]: boolean } = {
                will: false,
                dispatch: false,
                did: false,
                complete: false
            };
            // then
            appContext.events.onWillExecuteEachUseCase((payload, meta) => {
                isCalled.will = true;
                assert.ok(payload instanceof WillExecutedPayload);
                assert.equal(meta.useCase, eventUseCase);
                assert.equal(meta.parentUseCase, null);
            });
            // onDispatch should not called when UseCase will/did execute.
            appContext.events.onDispatch((payload, _meta) => {
                isCalled.dispatch = true;
                assert.ok(typeof payload === "object");
                assert.equal(payload, expectedPayload);
            });
            appContext.events.onDidExecuteEachUseCase((payload, meta) => {
                isCalled.did = true;
                assert.ok(payload instanceof DidExecutedPayload);
                assert.equal(meta.isTrusted, true);
                assert.equal(meta.useCase, eventUseCase);
                assert.equal(meta.parentUseCase, null);
            });
            appContext.events.onCompleteEachUseCase((payload, meta) => {
                isCalled.complete = true;
                assert.ok(payload instanceof CompletedPayload);
                assert.equal(meta.isTrusted, true);
                assert.equal(meta.useCase, eventUseCase);
                assert.equal(meta.parentUseCase, null);
            });
            // when
            return appContext
                .useCase(eventUseCase)
                .execute()
                .then(() => {
                    Object.keys(isCalled).forEach(key => {
                        assert.ok(isCalled[key] === true, `${key} should be called`);
                    });
                });
        });
    });
    describe("#onDidExecuteEachUseCase", function() {
        it("should called after UseCase did execute", function(done) {
            const dispatcher = new Dispatcher();
            const appContext = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const testUseCase = new TestUseCase();
            // then
            appContext.events.onDidExecuteEachUseCase((_payload, meta) => {
                assert.equal(meta.useCase, testUseCase);
                done();
            });
            // when
            appContext.useCase(testUseCase).execute();
        });
    });
    describe("#onCompleteEachUseCase", function() {
        it("always should be called by async", function() {
            const dispatcher = new Dispatcher();
            const appContext = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const testUseCase = new TestUseCase();
            // then
            let isCalled = false;
            appContext.events.onCompleteEachUseCase(() => {
                isCalled = true;
            });
            // when
            const promise = appContext.useCase(testUseCase).execute();
            // should not be called at time
            assert.ok(isCalled === false);
            return promise.then(() => {
                assert.ok(isCalled);
            });
        });
    });
    describe("#onErrorDispatch", function() {
        it("should called after UseCase did execute", function(done) {
            const dispatcher = new Dispatcher();
            const appContext = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const throwUseCase = new ThrowUseCase();
            // then
            appContext.events.onErrorDispatch((payload, meta) => {
                assert.ok(payload.error instanceof Error);
                assert.equal(typeof meta.timeStamp, "number");
                assert.equal(meta.useCase, throwUseCase);
                assert.equal(meta.parentUseCase, null);
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
            assert.ok(useCaseExecutor instanceof UseCaseExecutorImpl);
            useCaseExecutor.execute();
        });
    });
    describe("#execute", function() {
        describe("when pass UseCase constructor", function() {
            it("should throw AssertionError", function() {
                const dispatcher = new Dispatcher();
                const appContext = new Context({
                    dispatcher,
                    store: createEchoStore({ echo: { "1": 1 } })
                });
                assert.throws(() => {
                    // @ts-ignore
                    appContext.useCase(TestUseCase);
                });
            });
        });
    });
    describe("#release", () => {
        it("should release all handlers", () => {
            // add handler
            const dispatcher = new Dispatcher();
            const store = createStore({
                name: "test"
            });
            const context = new Context({
                dispatcher,
                store,
                options: {
                    strict: true
                }
            });
            const doneNotCall = () => {
                throw new Error("It should not called");
            };
            context.events.onBeginTransaction(() => {
                doneNotCall();
            });
            context.events.onEndTransaction(() => {
                doneNotCall();
            });
            context.events.onWillNotExecuteEachUseCase(() => {
                doneNotCall();
            });
            context.events.onWillExecuteEachUseCase(() => {
                doneNotCall();
            });
            context.events.onDidExecuteEachUseCase(() => {
                doneNotCall();
            });
            context.events.onDispatch(() => {
                doneNotCall();
            });
            context.onChange(() => {
                doneNotCall();
            });
            context.events.onErrorDispatch(() => {
                doneNotCall();
            });
            context.events.onCompleteEachUseCase(() => {
                doneNotCall();
            });
            // when
            context.release();
            // then - does not call any handler
            return context
                .transaction("transaction name", transactionContext => {
                    return transactionContext
                        .useCase(new DispatchUseCase())
                        .execute({
                            type: "test"
                        })
                        .then(() => {
                            return transactionContext.useCase(new ThrowUseCase()).execute();
                        })
                        .then(() => {
                            transactionContext.commit();
                        });
                })
                .then(() => {
                    store.emitChange();
                    return context.useCase(new ParentUseCase()).execute();
                });
        });
    });
    it("should execute functional UseCase", function() {
        const dispatcher = new Dispatcher();
        const appContext = new Context({
            dispatcher,
            store: createEchoStore({ echo: { "1": 1 } })
        });
        const callStack: DispatchedPayload[] = [];
        appContext.events.onDispatch((payload, _meta) => {
            callStack.push(payload);
        });
        const useCase: UseCaseFunction = ({ dispatcher }) => {
            return value => {
                dispatcher.dispatch({
                    type: "Example",
                    value
                });
            };
        };
        return appContext
            .useCase(useCase)
            .execute("value")
            .then(() => {
                assert.deepEqual(callStack, [
                    {
                        type: "Example",
                        value: "value"
                    }
                ]);
            });
    });
    it("should execute functional UseCase and lifecycle hook is called ", function() {
        const dispatcher = new Dispatcher();
        const appContext = new Context({
            dispatcher,
            store: createEchoStore({ echo: { "1": 1 } })
        });
        const callStack: DispatchedPayload[] = [];
        appContext.events.onDispatch((payload, _meta) => {
            callStack.push(payload);
        });
        appContext.events.onWillExecuteEachUseCase((payload, _meta) => {
            callStack.push(payload);
        });
        appContext.events.onDidExecuteEachUseCase((payload, _meta) => {
            callStack.push(payload);
        });
        appContext.events.onCompleteEachUseCase((payload, _meta) => {
            callStack.push(payload);
        });
        const useCase: UseCaseFunction = ({ dispatcher }) => {
            return value => {
                dispatcher.dispatch({
                    type: "Example",
                    value
                });
            };
        };
        return appContext
            .useCase(useCase)
            .execute("value")
            .then(() => {
                const expectedCallStackOfAUseCase = [
                    WillExecutedPayload,
                    Object /* {
                        type: "Example",
                        value: "value"
                    }*/,
                    DidExecutedPayload,
                    CompletedPayload
                ];
                assert.equal(callStack.length, expectedCallStackOfAUseCase.length);
                expectedCallStackOfAUseCase.forEach((_payload, index) => {
                    const ExpectedPayloadConstructor = expectedCallStackOfAUseCase[index];
                    assert.ok(callStack[index] instanceof ExpectedPayloadConstructor);
                });
            });
    });

    describe("Dispatcher", () => {
        it("`dispatcher` is optional", () => {
            const { MockStore, MockUseCase } = createUpdatableStoreWithUseCase("test");

            class UpdateUseCase extends MockUseCase {
                execute() {
                    this.dispatchUpdateState({
                        value: "update"
                    });
                }
            }

            // Context class provide observing and communicating with **Store** and **UseCase**
            const store = new MockStore();
            const storeGroup = new StoreGroup({
                test: store
            });
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: storeGroup
            });
            return context
                .useCase(new UpdateUseCase())
                .execute()
                .then(() => {
                    assert.deepEqual(storeGroup.getState(), {
                        test: {
                            value: "update"
                        }
                    });
                });
        });
    });

    describe("Constructor with Store instance", () => {
        it("should Context delegate payload to Store#receivePayload", () => {
            class CounterStore extends Store {
                public receivePayloadList: any[];

                constructor() {
                    super();
                    this.receivePayloadList = [];
                }

                receivePayload(payload: any) {
                    this.receivePayloadList.push(payload);
                }

                getState() {
                    return {};
                }
            }

            // UseCase
            class IncrementUseCase extends UseCase {
                execute() {
                    this.dispatch({
                        type: "INCREMENT"
                    });
                }
            }

            // Context class provide observing and communicating with **Store** and **UseCase**
            const counterStore = new CounterStore();
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: counterStore
            });
            return context
                .useCase(new IncrementUseCase())
                .execute()
                .then(() => {
                    assert.ok(counterStore.receivePayloadList.length > 0);
                });
        });
    });
});
