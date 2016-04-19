// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import UseCase from "../src/UseCase";
import Dispatcher from "../src/Dispatcher";
import Store from "../src/Store";
import Context from "../src/Context";
describe("UseCase", function () {
    context("when execute B UseCase in A UseCase", function () {
        it("UseCase should have `context` that is Context instance", function () {
            class TestUseCase extends UseCase {
                execute() {
                    // then
                    assert(this.context instanceof Context);
                    assert(typeof this.dispatch === "function");
                }
            }
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: new Store()
            });
            const useCase = new TestUseCase();
            // when
            context.useCase(useCase).execute();
        });
    });
    context("when not implemented execute()", function () {
        it("should assert error on constructor", function () {
            class TestUseCase extends UseCase {
            }
            try {
                const useCase = new TestUseCase();
                useCase.execute();
                throw new Error("unreachable");
            } catch (error) {
                assert(error.name === "TypeError");
            }
        });
    });
    describe("#throwError", function () {
        it("should dispatch thought onDispatch event", function (done) {
            class TestUseCase extends UseCase {
                execute() {
                    this.throwError(new Error("error"));
                }
            }
            const testUseCase = new TestUseCase();
            // then
            testUseCase.onDispatch(({type, error}) => {
                assert(error instanceof Error);
                done();
            });
            // when
            testUseCase.execute();
        });
    });
});