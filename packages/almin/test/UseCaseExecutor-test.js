// LICENSE : MIT
"use strict";
const sinon = require("sinon");
const assert = require("assert");
import { NoDispatchUseCase } from "./use-case/NoDispatchUseCase";
import { Dispatcher } from "../src/Dispatcher";
import { UseCase } from "../src/UseCase";
import { UseCaseExecutor } from "../src/UseCaseExecutor";
import { CallableUseCase } from "./use-case/CallableUseCase";
import { ThrowUseCase } from "./use-case/ThrowUseCase";

describe("UseCaseExecutor", function() {
    describe("#executor", () => {
        let consoleErrorStub = null;
        beforeEach(() => {
            consoleErrorStub = sinon.stub(console, "error");
        });
        afterEach(() => {
            consoleErrorStub.restore();
        });
        it("should catch sync throwing error in UseCase", () => {
            const dispatcher = new Dispatcher();
            const executor = new UseCaseExecutor({
                useCase: new ThrowUseCase(),
                dispatcher
            });
            return executor.executor(useCase => useCase.execute()).then(
                () => {
                    throw new Error("SHOULD NOT CALLED");
                },
                error => {
                    assert(error instanceof Error, "should be caught error");
                }
            );
        });
        it("should throw error when pass non-executor function and output console.error", () => {
            const dispatcher = new Dispatcher();
            const executor = new UseCaseExecutor({
                useCase: new NoDispatchUseCase(),
                dispatcher
            });
            return executor.executor(" THIS IS WRONG ").then(
                () => {
                    throw new Error("SHOULD NOT CALLED");
                },
                error => {
                    assert.ok(consoleErrorStub.called, "should be called console.error");
                    const warningMessage = consoleErrorStub.getCalls()[0].args[0];
                    assert.ok(/executor.*? arguments should be function/.test(error.message));
                    assert.equal(
                        warningMessage,
                        "Warning(UseCase): executor argument should be function. But this argument is not function: "
                    );
                }
            );
        });
        it("should accept executor(useCase => {}) function arguments", () => {
            const dispatcher = new Dispatcher();
            const callableUseCase = new CallableUseCase();
            const executor = new UseCaseExecutor({
                useCase: callableUseCase,
                dispatcher
            });
            return executor
                .executor(useCase =>
                    useCase.execute({
                        type: "type"
                    })
                )
                .then(
                    () => {
                        assert(callableUseCase.isExecuted, "UseCase#execute should be called");
                    },
                    error => {
                        throw new error();
                    }
                );
        });
        it("executor(useCase => {}) useCase is actual wrapper object", () => {
            const dispatcher = new Dispatcher();
            const executor = new UseCaseExecutor({
                useCase: new NoDispatchUseCase(),
                dispatcher
            });
            return executor.executor(useCase => {
                assert(useCase instanceof UseCase === false, "useCase is wrapped object. it is not UseCase");
                assert(typeof useCase.execute === "function", "UseCase#execute is callable");
                return useCase.execute();
            });
        });
        it("can call useCase.execute() by async", done => {
            const dispatcher = new Dispatcher();
            const callableUseCase = new CallableUseCase();
            const executor = new UseCaseExecutor({
                useCase: callableUseCase,
                dispatcher
            });
            executor
                .executor(useCase => {
                    Promise.resolve().then(() => {
                        useCase.execute();
                    });
                })
                .then(() => {
                    assert(callableUseCase.isExecuted, "UseCase#execute is called");
                    done();
                });
            // sync check
            assert(callableUseCase.isExecuted === false, "UseCase#execute is not called yet.");
        });
        describe("when UseCase#execute twice", () => {
            it("should show warning", () => {
                const dispatcher = new Dispatcher();
                const executor = new UseCaseExecutor({
                    useCase: new NoDispatchUseCase(),
                    dispatcher
                });
                return executor
                    .executor(useCase => {
                        useCase.execute();
                        useCase.execute();
                    })
                    .then(() => {
                        assert(consoleErrorStub.called);
                        const warningMessage = consoleErrorStub.getCalls()[0].args[0];
                        assert(
                            /Warning\(UseCase\): \w+#execute was called more than once./.test(warningMessage),
                            warningMessage
                        );
                    });
            });
        });
    });
    describe("when UseCase is successful completion", function() {
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
            executor.onDispatch(({ type, value }) => {
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
        it("should catch sync throwing error in UseCase", () => {
            const dispatcher = new Dispatcher();
            const executor = new UseCaseExecutor({
                useCase: new ThrowUseCase(),
                dispatcher
            });
            return executor.execute().then(
                () => {
                    throw new Error("SHOULD NOT CALLED");
                },
                error => {
                    assert(error instanceof Error, "should be caught error");
                }
            );
        });
        describe("when UseCase is sync", function() {
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

                // when
                const executor = new UseCaseExecutor({
                    useCase: new SyncUseCase(),
                    dispatcher
                });
                // 4
                executor.onDispatch(({ type, value }) => {
                    if (type === expectedPayload.type) {
                        assert.equal(value, expectedPayload.value);
                        done();
                    }
                });
                // then
                executor.execute(expectedPayload); // 1
            });
        });
        describe("when UseCase is async", function() {
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
                // when
                const executor = new UseCaseExecutor({
                    useCase: new AsyncUseCase(),
                    dispatcher
                });
                executor.onDidExecuteEachUseCase((payload, meta) => {
                    if (meta.useCase instanceof AsyncUseCase) {
                        isCalledDidExecuted = true;
                    }
                });
                executor.onCompleteExecuteEachUseCase((payload, meta) => {
                    if (meta.useCase instanceof AsyncUseCase) {
                        isCalledCompleted = true;
                    }
                });
                // 4
                executor.onDispatch(payload => {
                    if (payload.type === expectedPayload.type) {
                        assert.equal(payload.value, expectedPayload.value);
                        isCalledUseCase = true;
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
