import * as assert from "assert";
import { Context, Dispatcher, Store, StoreGroup } from "almin";
import AlminReactContainer from "../src/almin-react-container";
import * as React from "react";
import * as TestUtils from "react-dom/test-utils";

const createTestStore = <T extends {}>(initialState: T) => {
    class TestStore extends Store<T> {
        state: T;
        constructor() {
            super();
            this.state = initialState;
        }

        updateState(newState: T) {
            if (this.state !== newState) {
                this.state = newState;
                this.emitChange();
            }
        }

        getState() {
            return this.state;
        }
    }

    return new TestStore();
};
describe("almin-react-container", () => {
    context("when update with new state", () => {
        it("should update WrapperComponent with new props", () => {
            let updatedCount = 0;

            class Passthrough extends React.Component {
                componentWillUpdate() {
                    updatedCount++;
                }

                render() {
                    return <div />;
                }
            }

            // initial state
            const initialState = {
                testKey: "initial value"
            };
            const testStore = createTestStore(initialState);
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: testStore
            });
            const Container = AlminReactContainer.create(Passthrough, context);
            const tree = TestUtils.renderIntoDocument(<Container />) as React.Component;
            const container = TestUtils.findRenderedComponentWithType(tree, Container);
            const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough);
            // Initial state
            assert.strictEqual(updatedCount, 0);
            assert.deepEqual(container.state, initialState);
            assert.deepEqual(stub.props, initialState);
            // Update state
            const newState = {
                testKey: "new value"
            };
            testStore.updateState(newState);
            assert.strictEqual(updatedCount, 1);
            assert.deepEqual(container.state, newState, "should update state");
            assert.deepEqual(stub.props, newState, "should update props");
        });
    });
    context("when update with same state", () => {
        it("should not update WrapperComponent", () => {
            let updatedCount = 0;

            class Passthrough extends React.Component {
                componentWillUpdate() {
                    updatedCount++;
                }

                render() {
                    return <div />;
                }
            }

            // initial state
            const initialState = {
                testKey: "initial value"
            };
            const testStore = createTestStore(initialState);
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: testStore
            });
            const Container = AlminReactContainer.create(Passthrough, context);
            const tree = TestUtils.renderIntoDocument(<Container />);
            const container = TestUtils.findRenderedComponentWithType(tree as any, Container);
            const stub = TestUtils.findRenderedComponentWithType(tree as any, Passthrough);
            // Initial state
            assert.strictEqual(updatedCount, 0);
            assert.deepEqual(container.state, initialState);
            assert.deepEqual(stub.props, initialState);
            // Update same state
            const newState = initialState;
            testStore.updateState(newState);
            assert.strictEqual(updatedCount, 0);
            assert.deepEqual(container.state, newState, "should update state");
            assert.deepEqual(stub.props, newState, "should not update props");
        });
    });
    context("with custom props", () => {
        it("should pass props to Container", () => {
            // Store
            class MyState {
                value: string;
                constructor({ value }: { value: string }) {
                    this.value = value;
                }
            }
            class MyStore extends Store<MyState> {
                state: MyState;

                constructor() {
                    super();
                    this.state = new MyState({ value: "initial" });
                }

                getState() {
                    return this.state;
                }
            }

            const storeGroup = new StoreGroup({
                myState: new MyStore()
            });
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: storeGroup
            });

            type PassthroughProps = { custom: string } & typeof storeGroup.state;
            class Passthrough extends React.Component<PassthroughProps> {
                render() {
                    return <div>{this.props.custom}</div>;
                }
            }
            const Container = AlminReactContainer.create(Passthrough, context);
            const tree = TestUtils.renderIntoDocument(<Container custom={"value"} />);
            const stub = TestUtils.findRenderedComponentWithType(
                (tree as any) as React.Component<typeof Container>,
                Passthrough as any
            );
            assert.equal((stub.props as any).custom, "value", "should have custom value");
        });
    });
});
