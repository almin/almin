# Context
<!-- THIS DOCUMENT IS AUTOMATICALLY GENERATED FROM src/*.d.ts -->
<!-- Please edit src/*.ts and `npm run build:docs:api` -->










## Interface
```typescript
export declare class Context {
```

Context class provide observing and communicating with **Store** and **UseCase**.

----













## Interface
```typescript
    constructor({dispatcher, store}: {
        dispatcher: Dispatcher;
        store: QueuedStoreGroup | StoreGroup | Store;
    });
```

`dispatcher` is an instance of `Dispatcher`.
`store` is an instance of StoreLike implementation

### Example

It is minimal initialization.

```js
const context = new Context({
  dispatcher: new Dispatcher(),
  store: new Store()
});
```

In real case, you can pass `StoreGroup` instead of `Store`.

```js
const storeGroup = new StoreGroup([
  new AStore(), new BStore(), new CStore()
]);
const context = new Context({
  dispatcher: new Dispatcher(),
  store: new Store()
});
```

----









## Interface
```typescript
    getState<T>(): T;
```

Return state value of StoreGroup or Store.

### Example

If you pass `StoreGroup` to `store` of Constructor,
`Context#getState()` return the state object that merge each stores's state.

```js
const state = context.getState();
console.log(state);
// { aState, bState }
```

----









## Interface
```typescript
    onChange(onChangeHandler: (changingStores: Array<Store>) => void): void;
```

If anyone store that is passed to constructor is changed, then call `onChange`.
`onChange` arguments is an array of `Store` instances.

### Example

```js
context.onChange(changingStores => {
  console.log(changingStores); // Array<Store>
});
```

----









## Interface
```typescript
    useCase(useCase: (context: FunctionalUseCaseContext) => Function): UseCaseExecutor;
    useCase(useCase: UseCase): UseCaseExecutor;
```

`Context#useCase` can accept two type of UseCase.

- Instance of UseCase class
- **Functional UseCase**

### Example

```js
// UseCase class pattern
class AwesomeUseCase extends UseCase {
   execute(...args){ }
}

context.useCase(new AwesomeUseCase()).execute([1, 2, 3]);
```

OR

```js
// Functional UseCase pattern
const awesomeUseCase = ({dispatcher}) => {
   return (...args) => { }
};

context.useCase(awesomeUseCase).execute([1, 2, 3]);
```

----









## Interface
```typescript
    onWillExecuteEachUseCase(handler: (payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void;
```

Register `handler` function to Context.
`handler` is called when each useCases will execute.

----









## Interface
```typescript
    onDispatch(handler: (payload: DispatchedPayload, meta: DispatcherPayloadMeta) => void): () => void;
```

Register `handler` function to Context.
`handler` is called the `handler` with user-defined payload object when the UseCase dispatch with payload.
This `onDispatch` is not called at built-in event. It is filtered by Context.
If you want to *All* dispatched event and use listen directly your `dispatcher` object.
In other word, listen the dispatcher of `new Context({dispatcher})`.

### Example

```js
const dispatchUseCase = ({dispatcher}) => {
  return () => dispatcher.dispatch({ type: "fired-payload" });
};
context.onDispatch((payload, meta) => {
  console.log(payload); // { type: "fired-payload" }
});

context.useCase(dispatchUseCase).execute();
```

----









## Interface
```typescript
    onDidExecuteEachUseCase(handler: (payload: DispatchedPayload, meta: DispatcherPayloadMeta) => void): () => void;
```

`handler` is called when each useCases are executed.

----









## Interface
```typescript
    onCompleteEachUseCase(handler: (payload: CompletedPayload, meta: DispatcherPayloadMeta) => void): () => void;
```

`handler` is called when each useCases are completed.
This `handler` is always called asynchronously.

----









## Interface
```typescript
    onErrorDispatch(handler: (payload: ErrorPayload, meta: DispatcherPayloadMeta) => void): () => void;
```

`handler` is called when some UseCase throw Error.

Throwing Error is following case:

- Throw exception in a UseCase
- Return rejected promise in a UseCase
- Call `UseCase#throwError(error)`

----









## Interface
```typescript
    release(): void;

```

Release all events handler in Context.
You can call this when no more call event handler

----


