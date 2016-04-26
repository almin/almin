# Almin.js

## What is this?

Almin provide Flux/CQRS patterns for JavaScript application.

It aim to create scalable app.

![overview of almin-architecture](./resources/almin-architecture.png)

The above figure is overview of Almin architecture that is similar to CQRS([Command Query Responsibility Segregation](http://martinfowler.com/bliki/CQRS.html "Command Query Responsibility Segregation")).

But, Almin is not framework, provide only these components

- Dispatcher
- Context
- UseCase
- Store
- StoreGroup

Other components like Domain, Repository and State are written by you!
Of course, Almin help you to write other components.

You may notice that these components are similar to [Flux](https://github.com/facebook/flux "Flux") architecture.

| Almin      | Flux          | Redux                  |
|------------|---------------|------------------------|
| Dispatcher | Dispatcher    | store.dispatch         |
| Context    | Container     | Middleware/React Redux |
| UseCase    | ActionCreator | Actions                |
| Store      | Store         | Store                  |
| StoreGroup | Container     | combineReducers        |
| State      | Store         | Reducer                |
| Domain     |               |                        |
| Repository |               |                        |

:memo: `State`, `Domain` and `Repository` is optional on Almin,
because the best for these components is vary based on application.

### Core class

- Context
- Dispatcher
- Store
- UseCase

### Sub System

- StoreGroup
- UseCaseExecutor

### Dispatcher

Dispatcher is a EventEmitter like class.
It use `dispatch(payload)`/`onDispatch((payload) => {})` instead of `on("key", ...args)`/`emit("key", ...args)`

- `onDispatch(payload): Function`
    - listen dispatch event and return un-listen function.
- `dispatch(payload): void`
    - dispatch event with `payload` object.

`payload` object must have `type` property.

```js
{
    type: "type"
}
```

is a minimal payload object.

```js
{
    type: "show",
    value: "value",
}
```

payload object also have other properties maybe.
