# LifeCycleEventHub
<!-- THIS DOCUMENT IS AUTOMATICALLY GENERATED FROM src/*.ts -->
<!-- Please edit src/*.ts and `npm run build:docs:api` -->


## Interface

```typescript
onChangeStore(handler: (payload: StoreChangedPayload, meta: DispatcherPayloadMeta) => void): () => void;
    onBeginTransaction(handler: (payload: TransactionBeganPayload, meta: DispatcherPayloadMeta) => void): () => void;
    onEndTransaction(handler: (payload: TransactionEndedPayload, meta: DispatcherPayloadMeta) => void): () => void;
    onWillExecuteEachUseCase(handler: (payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void;
    onDispatch(handler: (payload: DispatchedPayload, meta: DispatcherPayloadMeta) => void): () => void;
    onDidExecuteEachUseCase(handler: (payload: DidExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void;
    onCompleteEachUseCase(handler: (payload: CompletedPayload, meta: DispatcherPayloadMeta) => void): () => void;
    onErrorDispatch(handler: (payload: ErrorPayload, meta: DispatcherPayloadMeta) => void): () => void;
    release(): void;
}
```

----

### `onChangeStore(handler: (payload: StoreChangedPayload, meta: DispatcherPayloadMeta) => void): () => void;`


Register `handler` function that is called when Store is changed.

## Notes

This event should not use for updating view.

```js
// BAD
context.events.onChangeStore(() => {
   updateView();
})
```

You should use `context.onChange` for updating view.

```
// GOOD
context.onChange(() => {
   updateView();
})
```

Because, `context.onChange` is optimized for updating view.
By contrast, `context.events.onChangeStore` is not optimized data.
It is useful data for logging.

----

### `onBeginTransaction(handler: (payload: TransactionBeganPayload, meta: DispatcherPayloadMeta) => void): () => void;`


Register `handler` function that is called when begin `Context.transaction`.

This `handler` will be not called when `Context.useCase` is executed.

----

### `onEndTransaction(handler: (payload: TransactionEndedPayload, meta: DispatcherPayloadMeta) => void): () => void;`


Register `handler` function that is called when `Context.transaction` is ended.

This `handler` will be not called when `Context.useCase` is executed.

----

### `onWillExecuteEachUseCase(handler: (payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void;`


Register `handler` function to Context.
`handler` is called when each useCases will execute.

----

### `onDispatch(handler: (payload: DispatchedPayload, meta: DispatcherPayloadMeta) => void): () => void;`


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

### `onDidExecuteEachUseCase(handler: (payload: DidExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void;`


`handler` is called when each useCases are executed.

----

### `onCompleteEachUseCase(handler: (payload: CompletedPayload, meta: DispatcherPayloadMeta) => void): () => void;`


`handler` is called when each useCases are completed.
This `handler` is always called asynchronously.

----

### `onErrorDispatch(handler: (payload: ErrorPayload, meta: DispatcherPayloadMeta) => void): () => void;`


`handler` is called when some UseCase throw Error.

Throwing Error is following case:

- Throw exception in a UseCase
- Return rejected promise in a UseCase
- Call `UseCase#throwError(error)`

----

### `release(): void;`


Release all events handler.

----

