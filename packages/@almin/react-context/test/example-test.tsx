import * as assert from "assert";
import { Context, StoreGroup } from "almin";
import { createReactContext } from "../src";
import * as React from "react";
import * as TestUtils from "react-dom/test-utils";
import { createStore } from "@almin/store-test-helper";

function render<P>(element: React.ReactElement<P>): React.Component<P> {
    return TestUtils.renderIntoDocument(element) as React.Component<P>;
}

describe("@almin/react-context", () => {
    describe("example", () => {
        it("should work", () => {
            // Create Almin context
            const context = new Context({
                // StoreGroup has {a, b, c} state
                store: new StoreGroup({
                    // createTestStore is a test helper that create Store instance of Almin
                    a: createStore({ value: "a" }),
                    b: createStore({ value: "b" }),
                    c: createStore({ value: "c" })
                })
            });
            // Create React Context that wrap Almin Context
            const { Consumer, Provider } = createReactContext(context);

            // Use Provider
            class App extends React.Component {
                render() {
                    return (
                        // You should wrap Consumer with Provider
                        <Provider>
                            {/* Consumer children props is called when Almin's context is changed */}
                            <Consumer>
                                {state => {
                                    return (
                                        <ul>
                                            <li>{state.a.value}</li>;
                                            <li>{state.b.value}</li>;
                                            <li>{state.c.value}</li>;
                                        </ul>
                                    );
                                }}
                            </Consumer>
                        </Provider>
                    );
                }
            }

            // Test
            const tree = render(<App />);
            const elements = TestUtils.scryRenderedDOMComponentsWithTag(tree, "li");
            assert.strictEqual(elements.length, 3);
        });
    });
});
