// MIT © 2017 azu
"use strict";
import * as assert from "assert";
import { Context, Dispatcher, Store, StoreGroup, UseCase } from "../src/";
import { createStore } from "./helper/create-new-store";
import { SyncNoDispatchUseCase } from "./use-case/SyncNoDispatchUseCase";
import { DispatchUseCase } from "./use-case/DispatchUseCase";
import { createUpdatableStoreWithUseCase } from "./helper/create-update-store-usecase";
import { AsyncUseCase } from "./use-case/AsyncUseCase";
import { DispatchedPayload } from "../src/Dispatcher";
import { StoreLike } from "../src/StoreLike";
import { TransactionBeganPayload } from "../src/payload/TransactionBeganPayload";
import { TransactionEndedPayload } from "../src/payload/TransactionEndedPayload";
import { Commitment } from "../src/UnitOfWork/UnitOfWork";

import sinon = require("sinon");
import { TransactionContext } from "../src/UnitOfWork/TransactionContext";

/**
 * create a Store that can handle receivePayload
 */
const createReceivePayloadStore = (receivePayloadHandler: ((payload: DispatchedPayload) => void)): Store => {
    class MockStore extends Store {
        constructor() {
            super();
            this.state = {};
        }

        receivePayload(payload: DispatchedPayload) {
            receivePayloadHandler(payload);
        }

        getState() {
            return this.state;
        }
    }

    return new MockStore();
};
describe("Context#transaction", () => {
    describe("id", () => {
        it("should be difference id between transactions", () => {
            const aStore = createStore({ name: "test" });
            const storeGroup = new StoreGroup({ a: aStore });
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: storeGroup,
                options: {
                    strict: true
                }
            });
            const getTransactionId = (): Promise<string> => {
                let id: string | null = null;
                return context
                    .transaction("transaction", transactionContext => {
                        id = transactionContext.id;
                        transactionContext.exit();
                        return Promise.resolve();
                    })
                    .then(() => {
                        return id as string;
                    });
            };
            const transactionA = getTransactionId();
            const transactionB = getTransactionId();
            return Promise.all([transactionA, transactionB]).then(([aId, bId]) => {
                assert.strictEqual(typeof aId, "string");
                assert.strictEqual(typeof bId, "string");
                assert.notStrictEqual(aId, bId);
            });
        });
    });
    context("Warning(Transaction):", () => {
        let consoleErrorStub: null | sinon.SinonStub = null;
        beforeEach(() => {
            consoleErrorStub = sinon.stub(console, "error");
        });
        afterEach(() => {
            consoleErrorStub!.restore();
        });
        it("should be warned when no-commit and no-exit in a transaction", function() {
            const aStore = createStore({ name: "test" });
            const storeGroup = new StoreGroup({ a: aStore });
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: storeGroup,
                options: {
                    strict: true
                }
            });
            // 1st transaction
            return context
                .transaction("transaction", _transactionContext => {
                    return Promise.resolve();
                })
                .then(() => {
                    assert.strictEqual(consoleErrorStub!.callCount, 1);
                });
        });
    });
    context("Error Pattern", () => {
        it("should throw error when return non-promise value in the transaction", function() {
            const aStore = createStore({ name: "test" });
            const storeGroup = new StoreGroup({ a: aStore });
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: storeGroup,
                options: {
                    strict: true
                }
            });
            return context
                .transaction("transaction name", () => {
                    return null as any; // non-promise value
                })
                .then(
                    () => {
                        assert.fail("DON'T CALL");
                    },
                    (error: Error) => {
                        const expectedMessage = "Error(Transaction): transactionHandler should return promise.";
                        assert.ok(error.message.indexOf(expectedMessage) !== -1);
                    }
                );
        });
        it("have unique id for in transactions", function() {
            const aStore = createStore({ name: "test" });
            const storeGroup = new StoreGroup({ a: aStore });
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: storeGroup,
                options: {
                    strict: true
                }
            });
            return context.transaction("transaction name", transactionContext => {
                assert.strictEqual(typeof transactionContext.id, "string");
                transactionContext.exit();
                return Promise.resolve();
            });
        });
        it("should throw error when do multiple exit in a transaction", function() {
            const aStore = createStore({ name: "test" });
            const storeGroup = new StoreGroup({ a: aStore });
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: storeGroup,
                options: {
                    strict: true
                }
            });
            return context
                .transaction("transaction name", transactionContext => {
                    transactionContext.exit();
                    transactionContext.exit();
                    return Promise.resolve();
                })
                .then(
                    () => {
                        assert.fail("DON'T CALL");
                    },
                    (error: Error) => {
                        const expectedMessage = `Error(Transaction): This unit of work is already commit() or exit().`;
                        assert.ok(error.message.indexOf(expectedMessage) !== -1);
                    }
                );
        });
        it("should throw error when do multiple commit in a transaction", function() {
            const aStore = createStore({ name: "test" });
            const storeGroup = new StoreGroup({ a: aStore });
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: storeGroup,
                options: {
                    strict: true
                }
            });
            return context
                .transaction("transaction name", transactionContext => {
                    transactionContext.commit();
                    transactionContext.commit();
                    return Promise.resolve();
                })
                .then(
                    () => {
                        assert.fail("DON'T CALL");
                    },
                    (error: Error) => {
                        const expectedMessage = `Error(Transaction): This unit of work is already commit() or exit().`;
                        assert.ok(error.message.indexOf(expectedMessage) !== -1);
                    }
                );
        });
    });
    context("When two unit of work is running", () => {
        it("should not lock the updating of StoreGroup", () => {
            const { MockStore: TransactionStore, MockUseCase: TransactionUseCase } = createUpdatableStoreWithUseCase(
                "TransactionTarget"
            );
            const { MockStore: UseCaseStore, MockUseCase: UseCaseUseCase } = createUpdatableStoreWithUseCase(
                "UseCaseTarget"
            );

            const transactionStore = new TransactionStore();
            const useCaseStore = new UseCaseStore();
            const storeGroup = new StoreGroup({ transactionStore, useCaseStore });

            class ChangeByTransactionUseCase extends TransactionUseCase {
                execute(state: any) {
                    this.requestUpdateState(state);
                }
            }

            class ChangeByUseCase extends UseCaseUseCase {
                execute(state: any) {
                    this.requestUpdateState(state);
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
            let onChangeCount = 0;
            let changedStores: StoreLike[] = [];
            context.onChange(stores => {
                onChangeCount++;
                changedStores = changedStores.concat(stores);
            });

            const runUseCase = (context: Context<any>) => {
                return context.useCase(new ChangeByUseCase()).executor(useCase => useCase.execute("useCase"));
            };
            const runTransaction = (transactionContext: TransactionContext) => {
                return transactionContext
                    .useCase(new ChangeByTransactionUseCase())
                    .executor(useCase => useCase.execute("transaction"));
            };
            // when
            // `transaction` should not lock store-group
            // different unit of work can affect the singleton store-group
            return context
                .transaction("transaction name", transactionContext => {
                    // `context`
                    return runUseCase(context)
                        .then(() => {
                            assert.strictEqual(
                                onChangeCount,
                                1,
                                "ChangeByUseCase can change store group, because transaction don't lock"
                            );
                        })
                        .then(() => {
                            return runTransaction(transactionContext);
                        })
                        .then(() => {
                            transactionContext.commit();
                        });
                })
                .then(() => {
                    assert.equal(onChangeCount, 2);
                    assert.equal(changedStores.length, 2);
                    assert.deepEqual(context.getState(), { transactionStore: "transaction", useCaseStore: "useCase" });
                });
        });
    });
    it("should collect up StoreGroup commit", function() {
        class AStore extends Store {
            constructor() {
                super();
                this.state = {};
            }

            receivePayload(payload: DispatchedPayload & { body: any }) {
                if (payload.type === "UPDATE") {
                    this.setState(payload.body);
                }
            }

            getState() {
                return this.state;
            }
        }

        const aStore = new AStore();
        const storeGroup = new StoreGroup({ a: aStore });

        class ChangeAUseCase extends UseCase {
            execute(state: any) {
                this.dispatch({
                    type: "UPDATE",
                    body: state
                });
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
        let onChangeCount = 0;
        let changedStores: StoreLike[] = [];
        context.onChange(stores => {
            onChangeCount++;
            changedStores = changedStores.concat(stores);
        });
        // when
        return context
            .transaction("transaction name", transactionContext => {
                return transactionContext
                    .useCase(new ChangeAUseCase())
                    .execute(1)
                    .then(() => transactionContext.useCase(new ChangeAUseCase()).execute(2))
                    .then(() => transactionContext.useCase(new ChangeAUseCase()).execute(3))
                    .then(() => transactionContext.useCase(new ChangeAUseCase()).execute(4))
                    .then(() => transactionContext.useCase(new ChangeAUseCase()).execute(5))
                    .then(() => {
                        transactionContext.commit();
                    });
            })
            .then(() => {
                assert.equal(onChangeCount, 1);
                assert.equal(changedStores.length, 1);
                assert.deepEqual(context.getState(), {
                    a: 5
                });
            });
    });
    it("should collect up StoreGroup commit", function() {
        const { MockStore: AStore, MockUseCase: AUseCase } = createUpdatableStoreWithUseCase("A");
        const { MockStore: BStore, MockUseCase: BUseCase } = createUpdatableStoreWithUseCase("B");
        const { MockStore: CStore, MockUseCase: CUseCase } = createUpdatableStoreWithUseCase("C");
        const aStore = new AStore();
        const bStore = new BStore();
        const cStore = new CStore();
        const storeGroup = new StoreGroup({ a: aStore, b: bStore, c: cStore });

        class ChangeAUseCase extends AUseCase {
            execute() {
                this.requestUpdateState(1);
            }
        }

        class ChangeBUseCase extends BUseCase {
            execute() {
                this.requestUpdateState(1);
            }
        }

        class ChangeCUseCase extends CUseCase {
            execute() {
                this.requestUpdateState(1);
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
        let onChangeCount = 0;
        let changedStores: StoreLike[] = [];
        context.onChange(stores => {
            onChangeCount++;
            changedStores = changedStores.concat(stores);
        });
        // when
        return context
            .transaction("transaction name", transactionContext => {
                return transactionContext
                    .useCase(new ChangeAUseCase())
                    .execute()
                    .then(() => {
                        return transactionContext.useCase(new ChangeBUseCase()).execute();
                    })
                    .then(() => {
                        return transactionContext.useCase(new ChangeCUseCase()).execute();
                    })
                    .then(() => {
                        // 1st commit
                        transactionContext.commit();
                    });
            })
            .then(() => {
                assert.equal(onChangeCount, 1);
                assert.equal(changedStores.length, 3);
                assert.deepEqual(context.getState(), {
                    a: 1,
                    b: 1,
                    c: 1
                });
            });
    });
    it("commit and each store#receivePayload is called", function() {
        const receivedPayloadList: DispatchedPayload[] = [];
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
        return context
            .transaction("transaction name", transactionContext => {
                assert.strictEqual(receivedPayloadList.length, 0, "no commitment");
                // Sync && No Dispatch UseCase call receivedPayloadList at once
                return transactionContext
                    .useCase(new SyncNoDispatchUseCase())
                    .execute()
                    .then(() => {
                        assert.strictEqual(receivedPayloadList.length, 0, "no commitment");
                        transactionContext.commit();
                        assert.strictEqual(receivedPayloadList.length, 1, "1 UseCase executed commitment");
                    });
            })
            .then(() => {
                return context.transaction("nest transaction", transactionContext => {
                    // AsyncUseCase call receivedPayloadList twice
                    return transactionContext
                        .useCase(new AsyncUseCase())
                        .execute()
                        .then(() => {
                            assert.strictEqual(receivedPayloadList.length, 1, "before: 1 UseCase executed commitment");
                            transactionContext.commit();
                            assert.strictEqual(
                                receivedPayloadList.length,
                                3,
                                "after: Async UseCase add (did + complete) commitment"
                            );
                        });
                });
            });
    });
    it("can receive begin/end payload of transaction via Context", function() {
        const aStore = createStore({ name: "test" });
        const storeGroup = new StoreGroup({ a: aStore });
        const dispatcher = new Dispatcher();
        const context = new Context({
            dispatcher,
            store: storeGroup,
            options: {
                strict: true
            }
        });
        const beginTransactions: TransactionBeganPayload[] = [];
        const endTransaction: TransactionEndedPayload[] = [];
        context.events.onBeginTransaction((payload, meta) => {
            beginTransactions.push(payload);
            assert.strictEqual(meta.isTrusted, true, "meta.isTrusted should be true");
            assert.strictEqual(meta.useCase, null, "meta.useCase should be null");
            assert.strictEqual(meta.parentUseCase, null, "meta.parentUseCase should be null");
            assert.strictEqual(typeof meta.timeStamp, "number");
            assert.strictEqual(typeof meta.transaction, "object", "transaction object");
            assert.strictEqual(typeof (meta.transaction as any).name, "string", "transaction object");
        });
        context.events.onEndTransaction((payload, meta) => {
            endTransaction.push(payload);
            assert.strictEqual(meta.isTrusted, true, "meta.isTrusted should be true");
            assert.strictEqual(meta.useCase, null, "meta.useCase should be null");
            assert.strictEqual(meta.parentUseCase, null, "meta.parentUseCase should be null");
            assert.strictEqual(typeof meta.timeStamp, "number");
            assert.strictEqual(typeof meta.transaction, "object", "transaction object");
            assert.strictEqual(typeof (meta.transaction as any).name, "string", "transaction object");
        });
        // 1st transaction
        return context
            .transaction("1st transaction", transactionContext => {
                return transactionContext
                    .useCase(new SyncNoDispatchUseCase())
                    .execute()
                    .then(() => {
                        transactionContext.commit();
                    })
                    .then(() => {
                        assert.strictEqual(beginTransactions.length, 1);
                        // commit does end
                        assert.strictEqual(endTransaction.length, 1);
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
                return context.transaction("2nd transaction", transactionContext => {
                    return transactionContext
                        .useCase(new SyncNoDispatchUseCase())
                        .execute()
                        .then(() => {
                            transactionContext.commit();
                        })
                        .then(() => {
                            assert.strictEqual(beginTransactions.length, 2);
                            assert.strictEqual(endTransaction.length, 2);
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

    it("should meta.transaction is current transaction", function() {
        const { MockStore: AStore, MockUseCase: AUseCase } = createUpdatableStoreWithUseCase("A");
        const aStore = new AStore();
        const storeGroup = new StoreGroup({ a: aStore });
        const dispatcher = new Dispatcher();
        const context = new Context({
            dispatcher,
            store: storeGroup,
            options: {
                strict: true
            }
        });

        class ChangeAUseCase extends AUseCase {
            execute() {
                this.requestUpdateState(1);
            }
        }

        const transactionName = "My Transaction";
        dispatcher.onDispatch((_payload, meta) => {
            if (!meta.transaction) {
                throw new Error("Not found meta.transaction");
            }
            assert.strictEqual(typeof meta.transaction.id, "string");
            assert.strictEqual(meta.transaction.name, transactionName);
        });
        // 1st transaction
        return context.transaction(transactionName, transactionContext => {
            return transactionContext
                .useCase(new SyncNoDispatchUseCase())
                .execute()
                .then(() => {
                    return transactionContext.useCase(new DispatchUseCase()).execute({
                        type: "test"
                    });
                })
                .then(() => {
                    return transactionContext.useCase(new ChangeAUseCase()).execute();
                })
                .then(() => {
                    transactionContext.commit();
                });
        });
    });
    it(
        "commit and each Store#onDispatch is not called," +
            "because, Store#onDispatch receive only dispatched the Payload by UseCase#dispatch.",
        function() {
            const receivedCommitments: Commitment[] = [];
            const aStore = createStore({ name: "test" });
            aStore.onDispatch((payload, meta) => {
                receivedCommitments.push({
                    payload,
                    meta,
                    debugId: "x"
                });
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
            return context
                .transaction("transaction 1", transactionContext => {
                    assert.strictEqual(receivedCommitments.length, 0, "no commitment");
                    return transactionContext
                        .useCase(new SyncNoDispatchUseCase())
                        .execute()
                        .then(() => {
                            assert.strictEqual(receivedCommitments.length, 0, "no commitment");
                            transactionContext.commit();
                            assert.strictEqual(receivedCommitments.length, 0, "1 UseCase executed commitment");
                        });
                })
                .then(() => {
                    return context.transaction("transaction 2", transactionContext => {
                        return transactionContext
                            .useCase(new SyncNoDispatchUseCase())
                            .execute()
                            .then(() => {
                                assert.strictEqual(
                                    receivedCommitments.length,
                                    0,
                                    "before: 1 UseCase executed commitment"
                                );
                                transactionContext.commit();
                                assert.strictEqual(
                                    receivedCommitments.length,
                                    0,
                                    "after: 2 UseCase executed 2 commitment"
                                );
                            });
                    });
                });
        }
    );
});
