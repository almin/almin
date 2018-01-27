// MIT © 2017 azu
import { AlminPerfMarker } from "../src/instrument/AlminPerfMarker";
import * as assert from "assert";
import { createUpdatableStoreWithUseCase } from "./helper/create-update-store-usecase";
import { Context, Dispatcher, StoreGroup } from "../src";
import AlminInstruments from "../src/instrument/AlminInstruments";

describe("AlminPerfMarker", () => {
    it("should enable/disable profiling", () => {
        const marker = new AlminPerfMarker();
        assert.ok(marker.isProfiling === false);
        marker.beginProfile();
        assert.ok(marker.isProfiling === true);
        marker.endProfile();
        assert.ok(marker.isProfiling === false);
    });
    it("should emit events", () => {
        const { MockStore: AStore, MockUseCase: AUseCase } = createUpdatableStoreWithUseCase("A");
        const aStore = new AStore();
        const storeGroup = new StoreGroup({ a: aStore });
        const dispatcher = new Dispatcher();
        const context = new Context({
            dispatcher,
            store: storeGroup,
            options: {
                strict: true,
                performanceProfile: true
            }
        });

        const events = [
            "beforeStoreGroupReadPhase",
            "afterStoreGroupReadPhase",
            "beforeStoreGroupWritePhase",
            "afterStoreGroupWritePhase",
            "beforeStoreGetState",
            "afterStoreGetState",
            "beforeStoreReceivePayload",
            "afterStoreReceivePayload",
            "willUseCaseExecute",
            "didUseCaseExecute",
            "completeUseCaseExecute",
            "beginTransaction",
            "endTransaction"
        ];
        const expected = [
            "beginTransaction",
            "willUseCaseExecute",
            "didUseCaseExecute",
            "completeUseCaseExecute",
            "beforeStoreGroupWritePhase",
            "beforeStoreReceivePayload",
            "afterStoreReceivePayload",
            "afterStoreGroupWritePhase",
            "beforeStoreGroupReadPhase",
            "beforeStoreGetState",
            "afterStoreGetState",
            "afterStoreGroupReadPhase",
            "endTransaction"
        ];
        const markedEvents: string[] = [];
        const debugTool = AlminInstruments.debugTool as AlminPerfMarker;
        if (debugTool) {
            events.forEach(event => {
                debugTool.on(event, () => {
                    markedEvents.push(event);
                });
            });
        }

        class ChangeAUseCase extends AUseCase {
            execute() {
                this.requestUpdateState(1);
            }
        }

        const transactionName = "My Transaction";
        return context
            .transaction(transactionName, transactionContext => {
                return transactionContext
                    .useCase(new ChangeAUseCase())
                    .execute()
                    .then(() => {
                        transactionContext.commit();
                    });
            })
            .then(() => {
                assert.deepEqual(markedEvents, expected);
            });
    });
});
