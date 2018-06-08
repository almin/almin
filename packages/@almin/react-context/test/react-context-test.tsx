import * as assert from "assert";
import { Context } from "almin";
import { createReactContext } from "../src";
import * as React from "react";
import * as TestUtils from "react-dom/test-utils";
import { createTestStore } from "./helper/create-test-store";

function render<P>(element: React.ReactElement<P>): React.Component<P> {
    return TestUtils.renderIntoDocument(element) as React.Component<P>;
}
describe("@almin/react-context", () => {
    describe("Provider/Consumer", () => {
        it("should render with initialState props", () => {
            const context = new Context({
                store: createTestStore({
                    value: "store-initial"
                })
            });
            const { Consumer, Provider } = createReactContext(context);

            class App extends React.Component {
                render() {
                    return (
                        <Provider initialState={{ value: "props-initial" }}>
                            <Consumer>
                                {state => {
                                    return <p>{state.value}</p>;
                                }}
                            </Consumer>
                        </Provider>
                    );
                }
            }

            const tree = render(<App />);
            const element = TestUtils.findRenderedDOMComponentWithTag(tree, "p");
            assert.strictEqual(element.textContent, "props-initial");
        });
        it("should render with initial getState() result", () => {
            const context = new Context({
                store: createTestStore({
                    value: "initial"
                })
            });
            const { Consumer, Provider } = createReactContext(context);

            class App extends React.Component {
                render() {
                    return (
                        <Provider>
                            <Consumer>
                                {state => {
                                    return <p>{state.value}</p>;
                                }}
                            </Consumer>
                        </Provider>
                    );
                }
            }

            const tree = render(<App />);
            const element = TestUtils.findRenderedDOMComponentWithTag(tree, "p");
            assert.strictEqual(element.textContent, "initial");
        });
        it("should re-render with updated state", () => {
            const testStore = createTestStore({
                value: "initial"
            });
            const context = new Context({
                store: testStore
            });
            const { Consumer, Provider } = createReactContext(context);

            class App extends React.Component {
                render() {
                    return (
                        <Provider>
                            <Consumer>
                                {state => {
                                    return <p>{state.value}</p>;
                                }}
                            </Consumer>
                        </Provider>
                    );
                }
            }

            const tree = render(<App />);
            if (!tree) {
                return;
            }
            // update
            testStore.updateState({
                value: "second"
            });
            const element = TestUtils.findRenderedDOMComponentWithTag(tree, "p");
            assert.strictEqual(element.textContent, "second");
        });
    });
});
