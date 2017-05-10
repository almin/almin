// LICENSE : MIT
"use strict";
const assert = require("assert");
const sinon = require("sinon");
import { UseCase } from "../lib/UseCase";
import { createEchoStore } from "./helper/EchoStore";
import { Dispatcher } from "../lib/Dispatcher";
import { Context } from "../lib/Context";

describe("FunctionalUseCase", function() {
    let consoleErrorStub = null;
    beforeEach(() => {
        consoleErrorStub = sinon.stub(console, "error");
    });
    afterEach(() => {
        consoleErrorStub.restore();
    });
    context("When passing wrong functional UseCase", () => {
        it("should show warning and throw Error", () => {
            class WriteToTextlintrcUseCase extends UseCase {
                static create() {
                    return new this();
                }

                constructor() {
                    super();
                }

                execute() {
                }
            }
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createEchoStore({ echo: { "a": "a" } })
            });
            assert.throws(() => {
                context.useCase(WriteToTextlintrcUseCase.create).execute();
                //                                            ~~
                //                                         missing call ()
            }, Error);
            // assert warning message
            assert(consoleErrorStub.called);
            const warningMessage = consoleErrorStub.getCalls()[0].args[0];
            assert(warningMessage.indexOf("Warning(UseCase): This is wrong Functional UseCase.") !== -1, warningMessage);
        });
    });
});
