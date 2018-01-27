// LICENSE : MIT
"use strict";
const assert = require("assert");
import { Context, Dispatcher, Store, StoreGroup, UseCase } from "../src/";
import { createUpdatableStoreWithUseCase } from "./helper/create-update-store-usecase";
import { AsyncUseCase } from "./use-case/AsyncUseCase";
import { SyncNoDispatchUseCase } from "./use-case/SyncNoDispatchUseCase";

describe("StoreGroup edge case", function() {
    describe("when {A,B}Store#emitChange on UseCase is completed", () => {
        it("should Context#onChange is called at once", () => {
            const { MockStore: AStore, requestUpdateState: changeAState } = createUpdatableStoreWithUseCase("A");
            const { MockStore: BStore, requestUpdateState: changeBState } = createUpdatableStoreWithUseCase("B");
            const aStore = new AStore();
            const bStore = new BStore();
            const storeGroup = new StoreGroup({ a: aStore, b: bStore });
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: storeGroup
            });

            let count = 0;
            context.onChange(() => {
                count++;
            });

            class ChangeAandBStateUseCase extends UseCase {
                execute() {
                    return Promise.resolve().then(() => {
                        // Update two states on CompletedPayload
                        changeAState("update a");
                        changeBState("update b");
                    });
                }
            }

            return context
                .useCase(new ChangeAandBStateUseCase())
                .execute()
                .then(() => {
                    assert.strictEqual(count, 1, "update a and b should be collect up. onChange should be called 1");
                });
        });
    });
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
            return context
                .useCase(new SyncNoDispatchUseCase())
                .execute()
                .then(() => {
                    assert.strictEqual(count, 1, "1 onChange by did(Sync UseCase)");
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

            const callStack: string[] = [];
            context.onChange(() => {
                callStack.push("change");
            });
            context.events.onDidExecuteEachUseCase(() => {
                callStack.push("did");
            });
            context.events.onCompleteEachUseCase(() => {
                callStack.push("complete");
            });
            return context
                .useCase(new AsyncUseCase())
                .execute()
                .then(() => {
                    assert.deepEqual(
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
