# GLOSSARY

## UseCase

It similar to ActionCreator on Flux.
It also become transaction script.

## Payload

Almin internal handle an event as payload object.

`payload` object must have `type` property.

```js
{
    type: "type"
}
```

is a minimal payload object.

```js
{
    type : "show",
    value: "value"
}
```

`payload` object also have other properties.

## Dispatcher

Dispatcher is a EventEmitter-like class.

It use `dispatch(payload)`/`onDispatch((payload) => {})` instead of `on("key", ...args)`/`emit("key", ...args)`

- `onDispatch(payload): Function`
    - listen dispatch event and return un-listen function.
- `dispatch(payload): void`
    - dispatch event with `payload` object.
    
## Flux

Flux is the application architecture for building client-side web applications.

- [Flux | Application Architecture for Building User Interfaces](https://facebook.github.io/flux/ "Flux | Application Architecture for Building User Interfaces")

## CQRS

CQRS stands for Command Query Responsibility Segregation.

CQRS split that conceptual model into separate models - Command(Write) model and Query(Read) model.