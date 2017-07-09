// MIT © 2017 azu
"use strict";
const assert = require("assert");
import { UseCase, Dispatcher, Context, Store } from "../lib/";
import { functionalUseCase } from "./use-case/FunctionalUseCase";
import { createStore } from "./helper/create-new-store";
describe("UseCaseContext", () => {
    context("useCase", () => {
        it("should execute functional useCase", () => {
            const expectedPayload = {
                "type": "expected"
            };
            const dispatched = [];
            class ParentUseCase extends UseCase {
                execute() {
                    return this.context.useCase(functionalUseCase).execute(expectedPayload.type);
                }
            }
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            context.onDispatch((payload) => {
                dispatched.push(payload);
            });
            return context.useCase(new ParentUseCase()).execute().then(() => {
                assert(dispatched.length === 1);
                assert.deepEqual(dispatched[0], expectedPayload);
            });
        });
    });
});
