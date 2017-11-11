// MIT © 2017 azu
"use strict";
import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Dispatcher, Context, Store } from "almin";
import { AlminReactContainer } from "almin-react-container";

// Store
class MyState {
    constructor({ value }) {
        this.value = value;
    }
}

class MyStore extends Store {
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
class App extends React.Component {
    render() {
        return <div>{this.props.myState.value}</div>;
    }
}

App.propTypes = {
    myState: PropTypes.instanceOf(MyState).isRequired
};
// Create Container
const RootContainer = AlminReactContainer.create(App, context);
// Render Container
ReactDOM.render(<RootContainer />, document.getElementById("js-app"));
