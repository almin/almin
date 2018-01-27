// MIT © 2017 azu
"use strict";
import * as assert from "assert";
import {
    CompletedPayload,
    Context,
    DidExecutedPayload,
    DispatchedPayload,
    Dispatcher,
    Payload,
    Store,
    StoreGroup
} from "../src";
import { InitializedPayload } from "../src/payload/InitializedPayload";
import { UseCaseFunction } from "../src/FunctionalUseCaseContext";

describe("UseCaseUnitOfWork", function() {
    describe("Integration with Store#onDispatch", () => {
        it("should not dispatch unnecessary payload to each store", function() {
            class TestStore extends Store<{ receive: any[]; onDispatchedPayload: DispatchedPayload[] }> {
                state: { receive: any[]; onDispatchedPayload: DispatchedPayload[] };

                constructor() {
                    super();
                    this.state = {
                        receive: [],
                        onDispatchedPayload: []
                    };
                    this.onDispatch(payload => {
                        this.state.onDispatchedPayload = this.state.onDispatchedPayload.concat(payload);
                    });
                }

                receivePayload(payload: any) {
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

            class MyPayload implements Payload {
                type = "MyPayload";
            }

            const useCase: UseCaseFunction = ({ dispatcher }) => {
                return () => {
                    dispatcher.dispatch(new MyPayload());
                };
            };
            // then
            return context
                .useCase(useCase)
                .execute()
                .then(() => {
                    const expectedReceivePayload = [
                        InitializedPayload,
                        MyPayload,
                        DidExecutedPayload,
                        CompletedPayload
                    ];
                    const expectedOnDispatchPayload = [MyPayload];
                    aStore.state.receive.forEach((payload, index) => {
                        const ConstructorPayload = expectedReceivePayload[index];
                        assert.ok(
                            payload instanceof ConstructorPayload,
                            `${JSON.stringify(payload)} should be instance of ${ConstructorPayload.name}`
                        );
                    });
                    aStore.state.onDispatchedPayload.forEach((payload, index) => {
                        const ConstructorPayload = expectedOnDispatchPayload[index];
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

                receivePayload(payload: any) {
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
            const useCase: UseCaseFunction = ({ dispatcher }) => {
                return () => {
                    dispatcher.dispatch({
                        type: "dispatch"
                    });
                };
            };
            // then
            return context
                .useCase(useCase)
                .execute()
                .then(() => {
                    assert.deepEqual(aStore.state.receive, bStore.state.receive);
                    assert.deepEqual(aStore.state.direct, bStore.state.direct);
                });
        });
    });
});
