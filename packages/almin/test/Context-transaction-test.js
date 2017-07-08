// MIT © 2017 azu
"use strict";
import * as assert from "assert";
import { createStore } from "./helper/create-new-store";
import { StoreGroup } from "../lib/UILayer/StoreGroup";
import { UseCase } from "../lib/UseCase";
import { Context } from "../lib/Context";
import { Dispatcher } from "../lib/Dispatcher";

describe("Context#transaction", () => {
    it("should collect up StoreGroup commit", function() {
        const aStore = createStore({ name: "AStore" });
        const bStore = createStore({ name: "BStore" });
        const cStore = createStore({ name: "CStore" });
        const storeGroup = new StoreGroup({ a: aStore, b: bStore, c: cStore });

        class ChangeAUseCase extends UseCase {
            execute() {
                aStore.updateState(1);
            }
        }

        class ChangeBUseCase extends UseCase {
            execute() {
                bStore.updateState(1);
            }
        }

        class ChangeCUseCase extends UseCase {
            execute() {
                cStore.updateState(1);
            }
        }

        const context = new Context({
            dispatcher: new Dispatcher(),
            store: storeGroup
        });
        // then - called change handler a one-time
        let calledCount = 0;
        let changedStores = [];
        storeGroup.onChange((stores) => {
            calledCount++;
            changedStores = changedStores.concat(stores);
        });
        // when
        return context.transaction(committer => {
            return committer.useCase(new ChangeAUseCase()).execute()
                .then(() => {
                    return committer.useCase(new ChangeBUseCase()).execute();
                }).then(() => {
                    return committer.useCase(new ChangeCUseCase()).execute();
                }).then(() => {
                    // 1st commit
                    committer.commit();
                });
        }).then(() => {
            assert.equal(calledCount, 1);
            assert.equal(changedStores.length, 3);
            assert.deepEqual(context.getState(), {
                a: 1,
                b: 1,
                c: 1
            });
        });
    });
});
