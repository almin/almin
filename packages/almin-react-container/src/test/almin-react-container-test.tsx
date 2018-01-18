// MIT © 2017 azu
// It is test file for d.ts
import AlminReactContainer from "../almin-react-container";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Dispatcher, Context, Store, StoreGroup } from "almin";

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
        this.state = new MyState({
            value: "Hello World!"
        });
    }

    getState() {
        return this.state;
    }
}

const storeGroup = new StoreGroup({
    myState: new MyStore()
});
// Context
const context = new Context({
    dispatcher: new Dispatcher(),
    store: storeGroup
});

// View

type AppState = typeof storeGroup.state & {
    // defined by App View
    custom?: string;
};

class App extends React.Component<AppState, {}> {
    render() {
        return <div>{this.props.myState.value}</div>;
    }
}

// Create Container
const RootContainer = AlminReactContainer.create(App, context);
console.log(RootContainer);

ReactDOM.render(<RootContainer />, document.body);
ReactDOM.render(<RootContainer custom={"value"} />, document.body);
// custom is optional
React.createElement(RootContainer);
React.createElement(RootContainer, {
    custom: "value"
});
