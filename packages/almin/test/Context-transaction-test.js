// MIT © 2017 azu
"use strict";
import * as assert from "assert";
import { Context, Dispatcher, Payload, Store, StoreGroup, UseCase } from "../src/";
import { DispatcherPayloadMetaImpl } from "../src/DispatcherPayloadMeta";
import { createStore } from "./helper/create-new-store";
import { NoDispatchUseCase } from "./use-case/NoDispatchUseCase";

/**
 * create a Store that can handle receivePayload
 */
const createReceivePayloadStore = receivePayloadHandler => {
    class MockStore extends Store {
        constructor() {
            super();
            this.state = {};
        }

        receivePayload(payload) {
            receivePayloadHandler(payload);
        }

        getState() {
            return this.state;
        }
    }

    return new MockStore();
};
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
            store: storeGroup,
            options: {
                strict: true
            }
        });
        // then - called change handler a one-time
        let calledCount = 0;
        let changedStores = [];
        storeGroup.onChange(stores => {
            calledCount++;
            changedStores = changedStores.concat(stores);
        });
        // when
        return context
            .transaction("transaction name", committer => {
                return committer
                    .useCase(new ChangeAUseCase())
                    .execute()
                    .then(() => {
                        return committer.useCase(new ChangeBUseCase()).execute();
                    })
                    .then(() => {
                        return committer.useCase(new ChangeCUseCase()).execute();
                    })
                    .then(() => {
                        // 1st commit
                        committer.commit();
                    });
            })
            .then(() => {
                assert.equal(calledCount, 1);
                assert.equal(changedStores.length, 3);
                assert.deepEqual(context.getState(), {
                    a: 1,
                    b: 1,
                    c: 1
                });
            });
    });
    it("commit and each store#receivePayload is called", function() {
        const receivedPayloadList = [];
        const aStore = createReceivePayloadStore(payload => {
            receivedPayloadList.push(payload);
        });
        const storeGroup = new StoreGroup({ a: aStore });
        const context = new Context({
            dispatcher: new Dispatcher(),
            store: storeGroup,
            options: {
                strict: true
            }
        });
        // reset initialized
        receivedPayloadList.length = 0;
        return context.transaction("transaction name", committer => {
            assert.strictEqual(receivedPayloadList.length, 0, "no commitment");
            return committer
                .useCase(new NoDispatchUseCase())
                .execute()
                .then(() => {
                    assert.strictEqual(receivedPayloadList.length, 0, "no commitment");
                    committer.commit();
                    assert.strictEqual(receivedPayloadList.length, 1, "1 UseCase executed commitment");
                })
                .then(() => {
                    return committer.useCase(new NoDispatchUseCase()).execute();
                })
                .then(() => {
                    assert.strictEqual(receivedPayloadList.length, 1, "before: 1 UseCase executed commitment");
                    committer.commit();
                    assert.strictEqual(receivedPayloadList.length, 2, "after: 2 UseCase executed commitment");
                });
        });
    });
    it("can receive begin/end payload of transaction via Context", function() {
        const aStore = createStore({ name: "test" });
        const storeGroup = new StoreGroup({ a: aStore });
        const context = new Context({
            dispatcher: new Dispatcher(),
            store: storeGroup,
            options: {
                strict: true
            }
        });
        const beginTransactions = [];
        const endTransaction = [];
        context.onBeginTransaction((payload, meta) => {
            beginTransactions.push(payload);
        });
        context.onEndTransaction((payload, meta) => {
            endTransaction.push(payload);
        });
        context.onEndTransaction((payload, meta) => {});
        // 1st transaction
        return context
            .transaction("1st transaction", committer => {
                return committer
                    .useCase(new NoDispatchUseCase())
                    .execute()
                    .then(() => {
                        committer.commit();
                    })
                    .then(() => {
                        assert.strictEqual(beginTransactions.length, 1);
                        assert.strictEqual(endTransaction.length, 0);
                    });
            })
            .then(() => {
                // assert 1st
                assert.strictEqual(beginTransactions.length, 1);
                const [beginPayload] = beginTransactions;
                assert.strictEqual(beginPayload.name, "1st transaction");
                assert.strictEqual(endTransaction.length, 1);
                const [endPayload] = endTransaction;
                assert.strictEqual(endPayload.name, "1st transaction");
                // 2nd transaction
                return context.transaction("2nd transaction", committer => {
                    return committer
                        .useCase(new NoDispatchUseCase())
                        .execute()
                        .then(() => {
                            committer.commit();
                        })
                        .then(() => {
                            assert.strictEqual(beginTransactions.length, 2);
                            assert.strictEqual(endTransaction.length, 1);
                        });
                });
            })
            .then(() => {
                // assert 2nd
                assert.strictEqual(beginTransactions.length, 2);
                const [, beginPayload] = beginTransactions;
                assert.strictEqual(beginPayload.name, "2nd transaction");
                assert.strictEqual(endTransaction.length, 2);
                const [, endPayload] = endTransaction;
                assert.strictEqual(endPayload.name, "2nd transaction");
            });
    });
    it("commit and each store#onDispatch is called", function() {
        const receivedCommitments = [];
        const aStore = createStore({ name: "test" });
        aStore.onDispatch((payload, meta) => {
            receivedCommitments.push([payload, meta]);
        });
        const storeGroup = new StoreGroup({ a: aStore });
        const context = new Context({
            dispatcher: new Dispatcher(),
            store: storeGroup,
            options: {
                strict: true
            }
        });
        // reset initialized
        receivedCommitments.length = 0;
        return context.transaction("transaction name", committer => {
            assert.strictEqual(receivedCommitments.length, 0, "no commitment");
            return committer
                .useCase(new NoDispatchUseCase())
                .execute()
                .then(() => {
                    assert.strictEqual(receivedCommitments.length, 0, "no commitment");
                    committer.commit();
                    assert.strictEqual(receivedCommitments.length, 1, "1 UseCase executed commitment");
                })
                .then(() => {
                    return committer.useCase(new NoDispatchUseCase()).execute();
                })
                .then(() => {
                    assert.strictEqual(receivedCommitments.length, 1, "before: 1 UseCase executed commitment");
                    committer.commit();
                    assert.strictEqual(receivedCommitments.length, 2, "after: 2 UseCase executed commitment");
                    const [payload, meta] = receivedCommitments[0];
                    assert.ok(payload instanceof Payload);
                    assert.ok(meta instanceof DispatcherPayloadMetaImpl);
                });
        });
    });
});
