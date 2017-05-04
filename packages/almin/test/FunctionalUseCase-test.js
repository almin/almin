// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const sinon = require("sinon");
import { UseCase } from "../lib/UseCase";
import { createEchoStore } from "./helper/EchoStore";
import { Dispatcher } from "../lib/Dispatcher";
import { Store } from "../lib/Store";
import { Context } from "../lib/Context";
import { UseCaseContext } from "../lib/UseCaseContext";

describe("FunctionalUseCase", function() {
    context("warning", () => {
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
    });
});
