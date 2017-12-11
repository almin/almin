---
id: tutorial-counter
title: "Counter Tutorial"
---

In this guide, we’ll walk through the process of creating a simple Counter app.

![counter](/docs/assets/counter.png)

## Source Code

You can get source code for counter app from here

- https://github.com/almin/almin/tree/master/examples/counter

```sh
git clone https://github.com/almin/almin.git

cd almin/examples/counter
npm install
npm start
# manually open
open http://localhost:8080/
```

## The purpose of counter

1. Press button and count up!

End.

### :memo: Notes: Recommendation

1 UseCase = 1 file

## UseCase

We start implementing the UseCase.

> 1. Press button and count up!

Start to create `IncrementalCounterUseCase` class.

```js
"use strict";
import {UseCase} from "almin"
export default class IncrementalCounterUseCase extends UseCase {
    // UseCase should implement #execute method
    execute() {
        // Write the UseCase code
    }
}
```

We want to update **counter app state**, if the `IncrementalCounterUseCase` is executed.

Simply, put **counter app state** to a **Store**.

## Store

Second, We create `CounterStore` class. 

```js
"use strict";
import {Store} from "almin";
export class CounterStore extends Store {
    constructor() {
        super();
        // receive event from UseCase, then update state
    }

    // return state object
    getState() {
        return {
            count: 0 
        }
    }
}
```

Almin's `Store` can receive the dispatched *event* from a UseCase.

:thought_balloon: Image:

1. IncrementalCounterUseCase dispatch "increment" event.
2. CounterStore receive the dispatched "increment" event and update own state.

This pattern is the same Flux architecture.

![flux-diagram-white-background](/docs/assets/flux-diagram-white-background.png)

In flux:

1. dispatch "increment" action via ActionCreator
2. Store receive "increment" action and update own state

## **UseCase** dispatch -> Store
 
Return to `IncrementalCounterUseCase` and add "dispatch increment event"

``` javascript
"use strict";
import { UseCase } from "almin";

export class IncrementalCounterUseCase extends UseCase {
    // IncrementalCounterUseCase dispatch "increment" ----> Store
    // UseCase should implement #execute method
    execute() {
        this.dispatch({
            type: "increment"
        });
    }
}

```

A class inherited `UseCase` has `this.dispatch(payload);` method.

`payload` object must have `type` property.

```json
{
    "type": "type"
}
```

is a minimal payload object.

Of course, you can include other property to the payload.

```json
{
    "type": "show",
    "value": "value"
}
```

So, `IncrementalCounterUseCase` dispatch "increment" payload.

## UseCase -> **Store** received

Next, We want to add the feature that can received "increment" payload to `CounterStore`.

A class inherited `Store` can implement `receivePayload` method.


```js
"use strict";
import { Store } from "almin";
export class CounterStore extends Store {
    constructor() {
        super();
        // initial state
        this.state = {
            count: 0
        };
    }

    // receive event from UseCase, then update state
    receivePayload(payload) {
        if(payload.type === "increment"){
            this.state.count++;
        }
    }

    // return the state
    getState() {
        return this.state;
    }
}
```

All that is updating `CounterStore`'s state!

But, We can separate the `state` and `CounterStore` as files.
It means that we can create `CounterState`.

**Store**

- Observe dispatch events and update state
    - Write state: `receivePayload()`
    - Read state: `getState()`

**State**

- It is state!

## State

We have created `CounterState.js`.

`CounterState`s main purpose

- receive "payload" and return state.

``` javascript
"use strict";

// reduce function
export class CounterState {
    /**
     * @param {Number} count
     */
    constructor({ count }) {
        this.count = count;
    }

    reduce(payload) {
        switch (payload.type) {
            // Increment Counter
            case "increment":
                return new CounterState({
                    count: this.count + 1
                });
            default:
                return this;
        }
    }
}

```

You may have seen the pattern. So, It is **reducer** in the Redux.

- [Reducers | Redux](https://redux.js.org/docs/basics/Reducers.html "Reducers | Redux")
- [Flux | Application Architecture for Building User Interfaces](https://facebook.github.io/flux/docs/flux-utils.html "Flux | Application Architecture for Building User Interfaces")

## Store -> State: NewState

Finally, we have added some code to `CounterStore`

1. Receive dispatched event, then update `CounterState`
2. `CounterStore#getState` return the instance of `CounterState`

A class inherited `Store` has `this.setState()` method that update own state if needed.

``` javascript
"use strict";
import { Store } from "almin";
import { CounterState } from "./CounterState";

export class CounterStore extends Store {
    constructor() {
        super();
        // initial state
        this.state = new CounterState({
            count: 0
        });
    }

    // receive event from UseCase, then update state
    receivePayload(payload) {
        this.setState(this.state.reduce(payload));
    }

    // return own state
    getState() {
        return this.state;
    }
}

```

### :memo: Note: Testing

We can test above classes independently.

- [almin/examples/counter/test at master · almin/almin](https://github.com/almin/almin/tree/master/examples/counter/test "almin/examples/counter/test at master · almin/almin")

## View Integration

This example use [React](https://reactjs.org/ "React").

### index.js

We will create `index.js` is the root of the application.

First, we create `Context` object that is communicator between Store and UseCase.

```js
import {Context, Dispatcher} from "almin";
import {CounterStore} from "./store/CounterStore";
// a single dispatcher
const dispatcher = new Dispatcher();
// initialize store
const counterStore = new CounterStore();
// create store group
const storeGroup = new StoreGroup({
    // stateName : store
    "counter": counterStore
});
// create context
const appContext = new Context({
    dispatcher,
    store: storeGroup
});
```

Second, We will pass the `appContext` to `App` component and render to DOM.

```jsx
ReactDOM.render(<App appContext={appContext} />, document.getElementById("js-app"))
```

Full code of `index.js`:

``` javascript
"use strict";
import React from "react";
import ReactDOM from "react-dom";
import { Context, Dispatcher, StoreGroup } from "almin";
import App from "./component/App";
import { CounterStore } from "./store/CounterStore";
// a single dispatcher
const dispatcher = new Dispatcher();
// a single store
const counterStore = new CounterStore();
// create store group
const storeGroup = new StoreGroup({
    // stateName : store
    counter: counterStore
});
// create context
const appContext = new Context({
    dispatcher,
    store: storeGroup,
    options: {
        // Optional: https://almin.js.org/docs/tips/strict-mode.html
        strict: true
    }
});
ReactDOM.render(<App appContext={appContext} />, document.getElementById("js-app"));

```

------

### App.js

We will create `App.js` is the root of component aka. Container component.

It receive `appContext` from `index.js` and use it.

Full code of `App.js`:

```` javascript
"use strict";
import React from "react";
import PropTypes from "prop-types";
import { Context } from "almin";
import { CounterState } from "../store/CounterState";
import { Counter } from "./Counter";

export default class App extends React.Component {
    componentWillMount() {
        const appContext = this.props.appContext;
        // set initial state
        this.setState(appContext.getState());
        // update component's state with store's state when store is changed
        const onChangeHandler = () => {
            this.setState(appContext.getState());
        };
        this.unSubscribe = appContext.onChange(onChangeHandler);
    }

    componentWillUnmount() {
        if (typeof this.unSubscribe === "function") {
            this.unSubscribe();
        }
    }

    render() {
        /**
         * Where is "CounterState" come from?
         * It is a `key` of StoreGroup.
         *
         * ```
         * const storeGroup = new StoreGroup({
         *   "counter": counterStore
         * });
         * ```
         * @type {CounterState}
         */
        const counterState = this.state.counter;
        return <Counter counterState={counterState} appContext={this.props.appContext} />;
    }
}
App.propTypes = {
    appContext: PropTypes.instanceOf(Context).isRequired
};

````

#### App's state

Root Component has state that sync to almin's state.

Focus on `onChange`:

```js
// update component's state with store's state when store is changed
const onChangeHandler = () => {
    this.setState(appContext.getState());
};
appContext.onChange(onChangeHandler);
```

If `CounterStore`'s state is changed(or `emitChange()`ed), call `onChangeHandler`.
`onChangeHandler` do update `App` component's state.

### Counter component

Counter component receive `counterState` and `appContext` via `this.props.`.

```js
CounterComponent.propTypes = {
    appContext: React.PropTypes.instanceOf(Context).isRequired,
    counterState: React.PropTypes.instanceOf(CounterState).isRequired
};
```

### Execute UseCase from View

We can execute `IncrementalCounterUseCase` when Counter's Increment button is clicked.

```js
    incrementCounter() {
        // execute IncrementalCounterUseCase with new count value
        const context = this.props.appContext;
        context.useCase(new IncrementalCounterUseCase()).execute();
    }
```

Execute `IncrementalCounterUseCase` and work following:

1. Execute `IncrementalCounterUseCase`
2. `CounterStore` is updated(create new `CounterState`)
3. `App` Component's state is updated via `onChangeHandler`
4. `Counter` receive new `CounterState`, refresh view

Full code of `Counter.js`:

``` javascript
"use strict";
import React from "react";
import PropTypes from "prop-types";
import { IncrementalCounterUseCase } from "../usecase/IncrementalCounterUseCase";
import { Context } from "almin";
import { CounterState } from "../store/CounterState";

export class Counter extends React.Component {
    incrementCounter() {
        // execute IncrementalCounterUseCase with new count value
        const context = this.props.appContext;
        context.useCase(new IncrementalCounterUseCase()).execute();
    }

    render() {
        // execute UseCase ----> Store
        const counterState = this.props.counterState;
        return (
            <div>
                <button onClick={this.incrementCounter.bind(this)}>Increment Counter</button>
                <p>Count: {counterState.count}</p>
            </div>
        );
    }
}

Counter.propTypes = {
    appContext: PropTypes.instanceOf(Context).isRequired,
    counterState: PropTypes.instanceOf(CounterState).isRequired
};

```


## End

We have created simple counter app.

Writing the pattern in this guide is the same of Flux pattern.

![almin-flux.png](/docs/assets/almin-architecture-flux.png)

Next: We learn domain model and CQRS pattern while creating TodoMVC app.
