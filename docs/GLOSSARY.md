# GLOSSARY

## UseCase

It similar to ActionCreator on Flux.
It also become transaction script.

## Payload

Almin internal handle an event as **payload** object.

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

### Dispatcher

Dispatcher is a EventEmitter like class.
It use `dispatch(payload)`/`onDispatch((payload) => {})` instead of `on("key", ...args)`/`emit("key", ...args)`

- `onDispatch(payload): Function`
    - listen dispatch event and return un-listen function.
- `dispatch(payload): void`
    - dispatch event with `payload` object.