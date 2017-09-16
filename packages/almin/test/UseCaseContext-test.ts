// MIT © 2017 azu
"use strict";
import * as assert from "assert";
import { Context, Dispatcher, UseCase } from "../src/";
import { createStore } from "./helper/create-new-store";
import { functionalUseCase } from "./use-case/FunctionalUseCase";

describe("UseCaseContext", () => {
    describe("useCase", () => {
        it("should execute functional useCase", () => {
            const expectedPayload = {
                type: "expected"
            };
            const dispatched: {}[] = [];

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
            context.events.onDispatch(payload => {
                dispatched.push(payload);
            });
            return context
                .useCase(new ParentUseCase())
                .execute()
                .then(() => {
                    assert(dispatched.length === 1);
                    assert.deepEqual(dispatched[0], expectedPayload);
                });
        });
    });
});
