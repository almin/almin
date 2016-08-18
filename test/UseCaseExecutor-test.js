// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import UseCaseExecutor from "../src/UseCaseExecutor";
import UseCase from "../src/UseCase";
import Dispatcher from "../src/Dispatcher";
describe("UseCaseExecutor", function() {
    context("when UseCase is successful completion", function() {
        it("dispatch will -> did", function() {
            // given
            const expectedPayload = {
                type: "SyncUseCase",
                value: "value"
            };
            const dispatcher = new Dispatcher();
            class SyncUseCase extends UseCase {
                execute(payload) {
                    this.dispatch(payload);
                }
            }
            const callStack = [];
            const expectedCallStack = [1, 2, 3];
            const executor = new UseCaseExecutor({
                useCase: new SyncUseCase(),
                dispatcher
            });
            // then
            executor.onWillExecuteEachUseCase(() => {
                callStack.push(1);
            });
            dispatcher.onDispatch(({type, value}) => {
                if (type === expectedPayload.type) {
                    callStack.push(2);
                }
            });
            executor.onDidExecuteEachUseCase(() => {
                callStack.push(3);
            });
            // when
            return executor.execute(expectedPayload).then(() => {
                assert.deepEqual(callStack, expectedCallStack);
            });
        });
    });
    describe("#execute", function() {
        context("when UseCase is sync", function() {
            it("execute is called", function(done) {
                // given
                const expectedPayload = {
                    type: "SyncUseCase",
                    value: "value"
                };
                const dispatcher = new Dispatcher();
                class SyncUseCase extends UseCase {
                    // 2
                    execute(payload) {
                        // 3
                        this.dispatch(payload);
                    }
                }
                // then
                // 4
                dispatcher.onDispatch(({type, value}) => {
                    if (type === expectedPayload.type) {
                        assert.equal(value, expectedPayload.value);
                        done();
                    }
                });
                // when
                const executor = new UseCaseExecutor({
                    useCase: new SyncUseCase(),
                    dispatcher
                });
                executor.execute(expectedPayload);// 1
            });
        });
        context("when UseCase is async", function() {
            it("execute is called", function() {
                // given
                const expectedPayload = {
                    type: "SyncUseCase",
                    value: "value"
                };
                const dispatcher = new Dispatcher();
                class AsyncUseCase extends UseCase {
                    // 2
                    execute(payload) {
                        return Promise.resolve().then(() => {
                            // 3
                            this.dispatch(payload);
                        });
                    }
                }
                // then
                let isCalledUseCase = false;
                let isCalledDidExecuted = false;
                let isCalledCompleted = false;
                // 4
                dispatcher.onDispatch(({type, value}) => {
                    if (type === expectedPayload.type) {
                        assert.equal(value, value);
                        isCalledUseCase = true;
                    }
                });
                // when
                const executor = new UseCaseExecutor({
                    useCase: new AsyncUseCase(),
                    dispatcher
                });
                executor.onDidExecuteEachUseCase(useCase => {
                    if (useCase instanceof AsyncUseCase) {
                        isCalledDidExecuted = true;
                    }
                });
                executor.onCompleteExecuteEachUseCase(useCase => {
                    if (useCase instanceof AsyncUseCase) {
                        isCalledCompleted = true;
                    }
                });
                // 1
                return executor.execute(expectedPayload).then(() => {
                    assert(isCalledUseCase);
                    assert(isCalledDidExecuted);
                    assert(isCalledCompleted);
                });
            });
        });
    });
});