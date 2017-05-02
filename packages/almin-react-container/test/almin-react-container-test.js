import assert from "assert";
import { Context, Dispatcher, Store } from "almin";
import AlminReactContainer from "../lib/almin-react-container";
import React, { Component } from "react";
import TestUtils from 'react-dom/test-utils'

const createTestStore = (initialState) => {
    class TestStore extends Store {
        constructor() {
            super();
            this.state = initialState
        }

        updateState(newState) {
            this.state = newState;
            this.emitChange();
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
            class Passthrough extends Component {
                componentWillUpdate() {
                    updatedCount++
                }

                render() {
                    return <div />
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
            const tree = TestUtils.renderIntoDocument(
                <Container />
            );
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
            class Passthrough extends Component {
                componentWillUpdate() {
                    updatedCount++
                }

                render() {
                    return <div />
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
            const tree = TestUtils.renderIntoDocument(
                <Container />
            );
            const container = TestUtils.findRenderedComponentWithType(tree, Container);
            const stub = TestUtils.findRenderedComponentWithType(tree, Passthrough);
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
    })
});