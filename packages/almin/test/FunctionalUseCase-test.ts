// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { Context, Dispatcher, UseCase } from "../src";
import { createEchoStore } from "./helper/EchoStore";
import { SinonStub } from "sinon";

const sinon = require("sinon");

describe("FunctionalUseCase", function() {
    let consoleErrorStub: SinonStub;
    beforeEach(() => {
        consoleErrorStub = sinon.stub(console, "error");
    });
    afterEach(() => {
        consoleErrorStub.restore();
    });
    describe("When passing wrong functional UseCase", () => {
        it("should show warning and throw Error", () => {
            class WriteToTextlintrcUseCase extends UseCase {
                static create() {
                    return new this();
                }

                constructor() {
                    super();
                }

                execute() {}
            }

            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createEchoStore({ name: "test", echo: { a: "a" } })
            });
            assert.throws(() => {
                // @ts-ignore
                context.useCase(WriteToTextlintrcUseCase.create).execute();
                //                                            ~~
                //                                         missing call ()
            }, Error);
            // assert warning message
            assert(consoleErrorStub.called);
            const warningMessage = consoleErrorStub.getCalls()[0].args[0];
            assert(
                warningMessage.indexOf("Warning(UseCase): This is wrong Functional UseCase.") !== -1,
                warningMessage
            );
        });
    });
});
