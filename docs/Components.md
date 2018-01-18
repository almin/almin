---
id: components
title: "Components of Almin"
---

This introduces components of Almin

Almin provides only these components.

- Dispatcher
- Context
- UseCase
- Store
- StoreGroup

Other components like Domain, Repository and State are written by You!

You may notice that these components are similar to [Flux](https://github.com/facebook/flux) or [Redux](https://github.com/reactjs/redux).
Almin is also a flux implementation library.

| Almin      | Flux          | Redux                  |
|------------|---------------|------------------------|
| Dispatcher | Dispatcher    | store.dispatch         |
| Context    | Container     | Middleware/React Redux |
| UseCase    | ActionCreator | Actions                |
| Store      | Store         | Store                  |
| StoreGroup | Container     | combineReducers        |
| (State)    | Store         | Reducer                |
| (Domain)   |               |                        |
|(Repository)|               |                        |

## View

Almin is not a View library.
Almin is not dependent on any view library.

We can create a **View** using any UI library like [React](https://reactjs.org/ "React").
Next, We want to add an **action** to a component of **View**.

```js
import React from "react";
class MyComponent extends React.Component {
    render(){
        return <div className="MyComponent">
            <button>Awesome button</button>
        </div>;
    }
}
```

## UseCase

Almin has `UseCase` class that is similar with ActionCreator.

For example, We want to add an **action** to the `<button>Awesome button</button>` and 
We are going to create a **UseCase** that `dispatch` the **action**.

```js
import {UseCase} from "almin";
class AwesomeUseCase extends UseCase {
    execute(){
        // dispatch **action**
        this.dispatch({
            type: "AwesomeUseCase"
        });
    }
}
```

Clicking the button and dispatch the **action**.
In other word, Clicking the button and executing the **UseCase** that dispatch the **action**.

Executing? A direct way is following the code, but we want **logging** the execution.

```js
const useCase = new AwesomeUseCase();
useCase.execute();
```

### Functional UseCase

It is a functional version of UseCase.

```js
class AwesomeUseCase extends UseCase {
   execute(...args){ }
}

context.useCase(new AwesomeUseCase()).execute([1, 2, 3]);
```

==

```js
const awesomeUseCase = ({dispatcher}) => {
   return (...args) => { }
};

context.useCase(awesomeUseCase).execute([1, 2, 3]);
```

The functional use-case is useful when the use-case does only `dispatch` like following.

```js
const dispatchUseCase = ({dispatcher}) => {
   return () => dispatcher.dispatch({ type: "fire" });
}
```

## Context

Almin has `Context` class for observing and communicating with **Store** and **UseCase**.

```js
import {Context} from "almin";
const context = new Context({ ... });
// context execute UseCase
const useCase = new AwesomeUseCase();
context(useCase).execute();
// Context#onDispatch etc... for logging!!
```

When the awesome button is clicked, execute the `AwesomeUseCase`:

```js
import {Context} from "almin";
import React from "react";
const context = new Context({ ... });
const onClick = () => {
    const useCase = new AwesomeUseCase();
    context(useCase).execute();
};
class MyComponent extends React.Component {
    render(){
        return <div className="MyComponent">
            <button onClick={onClick}>Awesome button</button>
        </div>;
    }
}
```

------

### Summarize the points so far

- Creating **View** using UI library
- **Action** is dispatched in **UseCase**
- **Context** connects **View** with **UseCase** 

-------

## Store

We can dispatch **actions** from UI events like clicking!
But, How to update view?

Almin has `Store` that is well-known application state container.
Store, State and Reducer is just a pattern of application.

We want to update a state if `AwesomeUseCase` is dispatched.
Simply write following to `AppStore`.

```js
import {Store} from "almin";
class AppStore extends Store {
    constructor(){
        super();
        this.state = {};
    }
    // Receive payload from UseCase via Context
    receivePayload(payload){
        switch(payload.type){
            case "AwesomeUseCase":
                return this.setState({/* new state */});
            default:
                return
        }
    }
    
    // return own state
    getState(){
        return this.state;
    }
}
```

What's the hub between `AwesomeUseCase` and `AppStore`?
Yes, `Context` has a role of hub.

`AwesomeUseCase` dispatches **action** -> Context -> AppStore receives the **action**

### Store -> View

View to know when store is updated.

What's the hub between `AppStore` and **View**?
`Context` has the role of hub again!

```js
import {Context, Dispatcher} from "almin";
const appStore = new AppStore();
const context = new Context({
    dispatcher: new Dispatcher(), 
    store: appStore
});
context.onChange((changedStore) => {
    // subscribe the change of Store
    // update View
});
```

## Conclusion

We learned a simply data flow of Almin.

1. Create View
2. Click Button
3. Context executes UseCase
4. UseCase dispatches action
5. Context passes the action to Store
6. Store is updated and the callback of `context.onChange` is called
7. Update View!
8. ♻️

### End

Almin does't aim to be a framework that contains all things.
Actually, Almin doesn't contain View and Domain classes.

We can learn some patterns for JavaScript Application via Almin.

After all, We should write code thinking :)

## Next

Next is [Hello World](HelloWorld.md) that shows a concept of the components.
