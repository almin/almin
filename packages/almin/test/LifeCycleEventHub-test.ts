import * as assert from "assert";
import { Context, DispatchedPayload, Dispatcher, DispatcherPayloadMeta, StoreGroup } from "../src";
import { createUpdatableStoreWithUseCase } from "./helper/create-update-store-usecase";

describe("LifeCycleEventHub", () => {
    // https://github.com/almin/almin/issues/328
    it("should sent `onDispatch` at once when dispatch and update store in UseCase", () => {
        const { MockStore: AStore, MockUseCase: AUseCase } = createUpdatableStoreWithUseCase("A");
        const aStore = new AStore();
        const storeGroup = new StoreGroup({
            a: aStore
        });
        const context = new Context({
            dispatcher: new Dispatcher(),
            store: storeGroup
        });
        const dispatchedLogs: [DispatchedPayload, DispatcherPayloadMeta][] = [];
        context.events.onDispatch((payload, meta) => {
            dispatchedLogs.push([payload, meta]);
        });

        // useCase
        class ExampleUseCase extends AUseCase {
            execute() {
                this.dispatchUpdateState({
                    value: "update value"
                });
            }
        }

        return context
            .useCase(new ExampleUseCase())
            .executor(useCase => useCase.execute())
            .then(() => {
                assert.equal(dispatchedLogs.length, 1, "should be dispatched at once");
            });
    });
});
