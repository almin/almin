// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { SyncNoDispatchUseCase } from "./use-case/SyncNoDispatchUseCase";
import { Payload, UseCase } from "../src/";
import { UseCaseExecutorImpl } from "../src/UseCaseExecutor";
import { CallableUseCase } from "./use-case/CallableUseCase";
import { ThrowUseCase } from "./use-case/ThrowUseCase";
import { isWillExecutedPayload } from "../src/payload/WillExecutedPayload";
import { isDidExecutedPayload } from "../src/payload/DidExecutedPayload";
import { isCompletedPayload } from "../src/payload/CompletedPayload";
import { isErrorPayload } from "../src/payload/ErrorPayload";
import sinon = require("sinon");

describe("UseCaseExecutor", function() {
    describe("#executor", () => {
        let consoleErrorStub: any = null;
        beforeEach(() => {
            consoleErrorStub = sinon.stub(console, "error");
        });
        afterEach(() => {
            consoleErrorStub.restore();
        });
        it("should catch sync throwing error in UseCase", () => {
            const executor = new UseCaseExecutorImpl({
                useCase: new ThrowUseCase(),
                parent: null
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
            const executor = new UseCaseExecutorImpl({
                useCase: new SyncNoDispatchUseCase(),
                parent: null
            });
            return executor.executor(" THIS IS WRONG " as any).then(
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
            const callableUseCase = new CallableUseCase();
            const executor = new UseCaseExecutorImpl({
                useCase: callableUseCase,
                parent: null
            });
            return executor.executor(useCase => useCase.execute()).then(
                () => {
                    assert(callableUseCase.isExecuted, "UseCase#execute should be called");
                },
                error => {
                    throw new error();
                }
            );
        });
        it("executor(useCase => {}) useCase is actual wrapper object", () => {
            const executor = new UseCaseExecutorImpl({
                useCase: new SyncNoDispatchUseCase(),
                parent: null
            });
            return executor.executor(useCase => {
                assert(useCase instanceof UseCase === false, "useCase is wrapped object. it is not UseCase");
                assert(typeof useCase.execute === "function", "UseCase#execute is callable");
                return useCase.execute();
            });
        });
        it("can call useCase.execute() by async", done => {
            const callableUseCase = new CallableUseCase();
            const executor = new UseCaseExecutorImpl({
                useCase: callableUseCase,
                parent: null
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
        it("should show warning when UseCase#execute twice", () => {
            const executor = new UseCaseExecutorImpl({
                useCase: new SyncNoDispatchUseCase(),
                parent: null
            });
            return executor
                .executor(useCase => {
                    useCase.execute();
                    useCase.execute();
                })
                .then(() => {
                    assert.ok(consoleErrorStub.called, "should be called console.error");
                    const warningMessage = consoleErrorStub.getCalls()[0].args[0];
                    assert.ok(/Warning\(UseCase\)/i.test(warningMessage), warningMessage);
                });
        });
    });
    describe("when UseCase throw error", function() {
        // Test: https://github.com/almin/almin/issues/310#issuecomment-359249751
        it("dispatch will -> error -> did -> complete", function() {
            const callStack: string[] = [];
            const expectedCallStack = ["will", "error", "did", "complete"];
            const executor = new UseCaseExecutorImpl({
                useCase: new ThrowUseCase(),
                parent: null
            });
            // then
            executor.onDispatch(payload => {
                if (isWillExecutedPayload(payload)) {
                    callStack.push("will");
                } else if (isDidExecutedPayload(payload)) {
                    callStack.push("did");
                } else if (isCompletedPayload(payload)) {
                    callStack.push("complete");
                } else if (isErrorPayload(payload)) {
                    callStack.push("error");
                }
            });
            // when
            return executor.execute().catch(() => {
                assert.deepEqual(callStack, expectedCallStack);
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

            class SyncUseCase extends UseCase {
                execute(payload: Payload) {
                    this.dispatch(payload);
                }
            }

            const callStack: string[] = [];
            const expectedCallStack = ["will", "dispatch", "did", "complete"];
            const executor = new UseCaseExecutorImpl({
                useCase: new SyncUseCase(),
                parent: null
            });
            // then
            executor.onDispatch(payload => {
                if (isWillExecutedPayload(payload)) {
                    callStack.push("will");
                } else if (payload.type === expectedPayload.type) {
                    callStack.push("dispatch");
                } else if (isDidExecutedPayload(payload)) {
                    callStack.push("did");
                } else if (isCompletedPayload(payload)) {
                    callStack.push("complete");
                }
            });
            // when
            return executor.execute(expectedPayload).then(() => {
                assert.deepEqual(callStack, expectedCallStack);
            });
        });
    });
    describe("#shouldExecute", () => {
        describe("when implemented shouldExecute()", function() {
            it("should called before execute", function() {
                const called: string[] = [];

                class TestUseCase extends UseCase {
                    shouldExecute() {
                        called.push("shouldExecute");
                        return true;
                    }

                    execute() {
                        called.push("execute");
                    }
                }

                const executor = new UseCaseExecutorImpl({
                    useCase: new TestUseCase(),
                    parent: null
                });
                return executor.execute().then(() => {
                    assert.deepEqual(called, ["shouldExecute", "execute"]);
                });
            });
        });
        describe("when shouldExecute() => false", function() {
            it("should not call UseCase#execute", function() {
                const called: string[] = [];

                class TestUseCase extends UseCase {
                    shouldExecute() {
                        called.push("shouldExecute");
                        return false;
                    }

                    execute() {
                        called.push("execute");
                    }
                }

                const executor = new UseCaseExecutorImpl({
                    useCase: new TestUseCase(),
                    parent: null
                });

                return executor.execute().then(() => {
                    assert.deepEqual(called, ["shouldExecute"]);
                });
            });
            it("should call onWillNotExecuteEachUseCase handler", function() {
                const called: string[] = [];

                class TestUseCase extends UseCase {
                    shouldExecute() {
                        called.push("shouldExecute");
                        return false;
                    }

                    execute() {
                        called.push("execute");
                    }
                }

                const executor = new UseCaseExecutorImpl({
                    useCase: new TestUseCase(),
                    parent: null
                });
                // willNotExecute:true => resolve
                return executor.execute().then(() => {
                    assert.deepEqual(called, ["shouldExecute"]);
                });
            });
        });
        describe("when shouldExecute() => undefined", function() {
            it("should throw error", function() {
                const called: string[] = [];

                class TestUseCase extends UseCase {
                    shouldExecute() {
                        called.push("shouldExecute");
                        return undefined as any;
                    }

                    execute() {
                        called.push("execute");
                    }
                }

                const executor = new UseCaseExecutorImpl({
                    useCase: new TestUseCase(),
                    parent: null
                });
                return executor.execute().then(
                    () => {
                        assert.fail("SHOULD NOT RESOLVED");
                    },
                    error => {
                        assert.ok(error instanceof Error);
                        assert.deepEqual(called, ["shouldExecute"]);
                    }
                );
            });
        });
    });
    describe("#execute", function() {
        it("should catch sync throwing error in UseCase", () => {
            const executor = new UseCaseExecutorImpl({
                useCase: new ThrowUseCase(),
                parent: null
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
                const ExpectedPayload = {
                    type: "SyncUseCase",
                    value: "value"
                };

                class SyncUseCase extends UseCase {
                    // 2
                    execute(payload: typeof ExpectedPayload) {
                        // 3
                        this.dispatch(payload);
                    }
                }

                // when
                const executor = new UseCaseExecutorImpl({
                    useCase: new SyncUseCase(),
                    parent: null
                });
                // 4
                executor.onDispatch((payload: any) => {
                    if (payload.type === ExpectedPayload.type) {
                        assert.equal(payload.value, ExpectedPayload.value);
                        done();
                    }
                });
                // then
                executor.execute(ExpectedPayload); // 1
            });
        });
        describe("when UseCase is async", function() {
            it("execute is called", function() {
                // given
                const ExpectedPayload = {
                    type: "SyncUseCase",
                    value: "value"
                };

                class AsyncUseCase extends UseCase {
                    // 2
                    execute(payload: Payload) {
                        return Promise.resolve().then(() => {
                            // 3
                            this.dispatch(payload);
                        });
                    }
                }

                let isCalledUseCase = false;
                let isCalledDidExecuted = false;
                let isCalledCompleted = false;
                // when
                const executor = new UseCaseExecutorImpl({
                    useCase: new AsyncUseCase(),
                    parent: null
                });
                executor.onDispatch((payload, meta) => {
                    if (isDidExecutedPayload(payload) && meta.useCase instanceof AsyncUseCase) {
                        isCalledDidExecuted = true;
                    } else if (isCompletedPayload(payload) && meta.useCase instanceof AsyncUseCase) {
                        isCalledCompleted = true;
                    } else if (payload.type === ExpectedPayload.type) {
                        assert.equal((payload as typeof ExpectedPayload).value, ExpectedPayload.value);
                        isCalledUseCase = true;
                    }
                });
                // then
                return executor.execute(ExpectedPayload).then(() => {
                    assert(isCalledUseCase);
                    assert(isCalledDidExecuted);
                    assert(isCalledCompleted);
                });
            });
        });
    });
});
