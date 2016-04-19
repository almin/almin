# Alken Framework

Alken is a flux/CQRS like library.

## Feature

Alken provide a pattern, is not framework.

- Testable
- Scalable
- Responsibility Layers patten - well-known Domain-Driven Design

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

## Installation

    npm install alken

## Usage

- [ ] Write usage instructions

## Tests

    npm test

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT