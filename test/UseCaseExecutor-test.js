// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import UseCaseExecutor from "../src/UseCaseExecutor";
import UseCase from "../src/UseCase";
import Dispatcher from "../src/Dispatcher";
describe("UseCaseExecutor", function () {
    context("when UseCase is successful completion", function () {
        it("dispatch will -> did", function () {
            // given
            class SyncUseCase extends UseCase {
                execute(value) {
                    this.dispatch({
                        type: SyncUseCase.name,
                        value
                    });
                }
            }
            const callStack = [];
            const expectedCallStack = [1, 2, 3];
            class MockDispatcher extends Dispatcher {
                dispatchWillExecuteUseCase() {
                    callStack.push(1);
                }

                dispatchDidExecuteUseCase() {
                    callStack.push(3);
                }
            }
            const dispatcher = new MockDispatcher();
            // then
            dispatcher.onDispatch(({type, value}) => {
                if (type === SyncUseCase.name) {
                    callStack.push(2);
                }
            });
            // when
            const executor = new UseCaseExecutor(new SyncUseCase(), dispatcher);
            return executor.execute().then(() => {
                assert.deepEqual(callStack, expectedCallStack);
            });
        });
    });
    describe("#execute", function () {
        context("when UseCase is sync", function () {
            it("execute is called", function (done) {
                // given
                class SyncUseCase extends UseCase {
                    execute(value) {
                        this.dispatch({
                            type: SyncUseCase.name,
                            value
                        });
                    }
                }
                const dispatcher = new Dispatcher();
                const expectedValue = "value";
                // then
                dispatcher.onDispatch(({type, value}) => {
                    if (type === SyncUseCase.name) {
                        assert.equal(value, expectedValue);
                        done();
                    }
                });
                // when
                const executor = new UseCaseExecutor(new SyncUseCase(), dispatcher);
                executor.execute(expectedValue);
            });
        });
        context("when UseCase is async", function () {
            it("execute is called", function (done) {
                // given
                class AsyncUseCase extends UseCase {
                    execute(value) {
                        return Promise.resolve().then(() => {
                            this.dispatch({
                                type: AsyncUseCase.name,
                                value
                            });
                        });
                    }
                }
                const dispatcher = new Dispatcher();
                const expectedValue = "value";
                // then
                let isCalledUseCase = false;
                dispatcher.onDispatch(({type, value}) => {
                    if (type === AsyncUseCase.name) {
                        assert.equal(value, expectedValue);
                        isCalledUseCase = true;
                    }
                });
                dispatcher.onDidExecuteEachUseCase(useCase => {
                    if (useCase instanceof AsyncUseCase) {
                        assert(isCalledUseCase);
                        done();
                    }
                });
                // when
                const executor = new UseCaseExecutor(new AsyncUseCase(), dispatcher);
                executor.execute(expectedValue);
            });
        });
    });
});