// MIT © 2017 azu
// It is test file for d.ts
import AlminReactContainer from "../almin-react-container";
import * as React from "react";
import { Dispatcher, Context, Store } from "almin";
// Store
class MyState {
    value: string;

    constructor({value}: {value: string}) {
        this.value = value;
    }
}
class MyStore extends Store {
    state: MyState;

    constructor() {
        super();
        this.state = new MyState({
            value: "Hello World!"
        });
    }

    getState() {
        return {
            myState: this.state
        };
    }
}
// Context
const context = new Context({
    dispatcher: new Dispatcher(),
    store: new MyStore()
});

// View
class App extends React.Component<AppState, {}> {
    render() {
        return <div>{this.props.myState.value}</div>
    }
}
interface AppState {
    myState: MyState
}
// Create Container
const RootContainer = AlminReactContainer.create<AppState>(App, context);
console.log(RootContainer);