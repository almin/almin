// MIT © 2017 azu
"use strict";
import * as assert from "assert";
import { CompletedPayload, Context, DidExecutedPayload, Dispatcher, Payload, Store, StoreGroup } from "../src/index";
import { InitializedPayload } from "../src/payload/InitializedPayload";

describe("UseCaseUnitOfWork", function() {
    describe("Integration with Store#onDispatch", () => {
        it("should not dispatch unnecessary payload to each store", function() {
            class TestStore extends Store {
                constructor() {
                    super();
                    this.state = {
                        receive: [],
                        direct: []
                    };
                    this.onDispatch(payload => {
                        this.state.direct = this.state.direct.concat(payload);
                    });
                }

                receivePayload(payload) {
                    this.state.receive = this.state.receive.concat(payload);
                }

                getState() {
                    return this.state;
                }
            }

            const aStore = new TestStore();
            const storeGroup = new StoreGroup({ a: aStore });
            // when
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: storeGroup
            });

            class MyPayload extends Payload {
                constructor() {
                    super({ type: "MyPayload" });
                }
            }

            const useCase = ({ dispatcher }) => {
                return () => {
                    dispatcher.dispatch(new MyPayload());
                };
            };
            // then
            return context.useCase(useCase).execute().then(() => {
                assert.deepStrictEqual(aStore.state.receive, aStore.state.direct);
                const expectedPayload = [InitializedPayload, MyPayload, DidExecutedPayload, CompletedPayload];
                aStore.state.receive.forEach((payload, index) => {
                    const ConstructorPayload = expectedPayload[index];
                    assert.ok(
                        payload instanceof ConstructorPayload,
                        `${JSON.stringify(payload)} should be instance of ${ConstructorPayload.name}`
                    );
                });
            });
        });
        it("should dispatch payload to each store", function() {
            class TestStore extends Store {
                constructor() {
                    super();
                    this.state = {
                        receive: [],
                        direct: []
                    };
                    this.onDispatch(payload => {
                        this.state.direct = this.state.direct.concat(payload);
                    });
                }

                receivePayload(payload) {
                    this.state.receive = this.state.receive.concat(payload);
                }

                getState() {
                    return this.state;
                }
            }

            const aStore = new TestStore();
            const bStore = new TestStore();
            const storeGroup = new StoreGroup({ a: aStore, b: bStore });
            // when
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: storeGroup
            });
            const useCase = ({ dispatcher }) => {
                return () => {
                    dispatcher.dispatch({
                        type: "dispatch"
                    });
                };
            };
            // then
            return context.useCase(useCase).execute().then(() => {
                assert.deepStrictEqual(aStore.state.receive, aStore.state.direct);
                assert.deepStrictEqual(bStore.state.receive, bStore.state.direct);
                assert.deepStrictEqual(aStore.state.receive, bStore.state.receive);
                assert.deepStrictEqual(aStore.state.direct, bStore.state.direct);
            });
        });
    });
});
