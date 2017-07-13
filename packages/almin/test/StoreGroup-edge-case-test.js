// LICENSE : MIT
"use strict";
const assert = require("assert");
const sinon = require("sinon");
import { Context } from "../src/Context";
import { Dispatcher } from "../src/Dispatcher";
import { Store } from "../src/Store";
import { StoreGroup } from "../src/UILayer/StoreGroup";
import { NoDispatchUseCase } from "./use-case/NoDispatchUseCase";
import ReturnPromiseUseCase from "./use-case/ReturnPromiseUseCase";

describe("StoreGroup edge case", function() {
    // See https://github.com/almin/almin/issues/179
    describe("when call Store#emitChange in Store#receivePayload", () => {
        it("should not infinity loop", () => {
            class AStore extends Store {
                constructor() {
                    super();
                    this.state = 0;
                }

                receivePayload() {
                    this.state = this.state + 1;
                    this.emitChange();
                }

                getState() {
                    return this.state;
                }
            }

            const aStore = new AStore();
            const storeGroup = new StoreGroup({ a: aStore });
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: storeGroup
            });

            let count = 0;
            context.onChange(() => {
                count++;
            });
            return context.useCase(new NoDispatchUseCase()).execute().then(() => {
                assert(count === 1);
            });
        });
    });
    // See https://github.com/almin/almin/issues/230
    describe("Test: avoid unnecessary duplicated emitChange", () => {
        it("Store#receivePayload should be called before onCompleteEachUseCase ", () => {
            class AStore extends Store {
                constructor() {
                    super();
                    this.state = {
                        count: 0
                    };
                }

                receivePayload() {
                    this.setState({ count: this.state.count + 1 });
                }

                getState() {
                    return this.state;
                }
            }

            const aStore = new AStore();
            const storeGroup = new StoreGroup({ a: aStore });
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: storeGroup
            });

            const callStack = [];
            context.onChange(() => {
                callStack.push("change");
            });
            context.onDidExecuteEachUseCase(() => {
                callStack.push("did");
            });
            context.onCompleteEachUseCase(() => {
                callStack.push("complete");
            });
            return context.useCase(new ReturnPromiseUseCase()).execute().then(() => {
                assert.deepStrictEqual(
                    callStack,
                    [
                        "change", // didExecute - receivePayload
                        "did",
                        "change", // complete - receivePayload
                        "complete"
                    ],
                    "should be receivePayload -> almin lifecycle event"
                );
            });
        });
    });
});
