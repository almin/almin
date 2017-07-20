# Context
<!-- THIS DOCUMENT IS AUTOMATICALLY GENERATED FROM src/*.ts -->
<!-- Please edit src/*.ts and `npm run build:docs:api` -->


## Interface

```typescript
export interface ContextArgs<T> {
    dispatcher: Dispatcher;
    store: StoreLike<T>;
    options?: {
        strict?: boolean;
    };
}
export declare class Context<T> {
    constructor(args: ContextArgs<T>);
    readonly events: LifeCycleEventHub;
    getState(): StateMap<T>;
    onChange(handler: (changingStores: Array<StoreLike<any>>) => void): () => void;
    useCase(useCase: UseCaseFunction): UseCaseExecutor<FunctionalUseCase>;
    useCase<T extends UseCaseLike>(useCase: T): UseCaseExecutor<T>;
    transaction(name: string, transactionHandler: (transactionContext: TransactionContext) => Promise<any>): Promise<void>;
    onWillExecuteEachUseCase(handler: (payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void;
    onDispatch(handler: (payload: DispatchedPayload, meta: DispatcherPayloadMeta) => void): () => void;
    onDidExecuteEachUseCase(handler: (payload: DidExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void;
    onCompleteEachUseCase(handler: (payload: CompletedPayload, meta: DispatcherPayloadMeta) => void): () => void;
    onErrorDispatch(handler: (payload: ErrorPayload, meta: DispatcherPayloadMeta) => void): () => void;
    release(): void;
}
```

----

### Interface 
```typescript
export interface ContextArgs<T> {
    dispatcher: Dispatcher;
    store: StoreLike<T>;
    options?: {
        strict?: boolean;
    };
```


Context arguments

----

### `export declare class Context<T> {`


Context class provide observing and communicating with **Store** and **UseCase**.

----

### `constructor(args: ContextArgs<T>);`


`dispatcher` is an instance of `Dispatcher`.
`store` is an instance of StoreLike implementation

### Example

It is minimal initialization.

```js
const context = new Context({
  dispatcher: new Dispatcher(),
  store: new MyStore()
});
```

In real case, you can pass `StoreGroup` instead of `Store`.

```js
const storeGroup = new StoreGroup([
  new AStore(), new BStore(), new CStore()
]);
const context = new Context({
  dispatcher: new Dispatcher(),
  store: storeGroup
});
```

----

### `readonly events: LifeCycleEventHub;`


Return almin life cycle events hub.
You can observe life cycle events on almin.

See LifeCycleEventHub

----

### `getState(): StateMap<T>;`


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

### `onChange(handler: (changingStores: Array<StoreLike<any>>) => void): () => void;`


If anyone store that is passed to constructor is changed, `handler` is called.
`onChange` arguments is an array of `Store` instances that are changed.

It returns unSubscribe function.
If you want to release handler, the returned function.

It is useful for updating view in the `handler`.

### Example

```js
const unSubscribe = context.onChange(changingStores => {
  console.log(changingStores); // Array<Store>
  // Update view
});
```


## Notes

If you want to know the change of registered store, please use `context.onChange`.
`context.onChange` is optimized for updating View.
By contrast, `context.events.*` is not optimized data. it is useful for logging.

----

### Interface 
```typescript
useCase(useCase: UseCaseFunction): UseCaseExecutor<FunctionalUseCase>;
useCase<T extends UseCaseLike>(useCase: T): UseCaseExecutor<T>;
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

### `transaction(name: string, transactionHandler: (transactionContext: TransactionContext) => Promise<any>): Promise<void>;`


## Transaction

- **Stability**: Experimental
- This feature is subject to change. It may change or be removed in future versions.

Create new Unit of Work and execute UseCase.
You can prevent heavy updating of StoreGroup.

This feature only work in strict mode.

Difference with `Context#useCase`:

- Do not update StoreGroup automatically
- You should call `transactionContext.commit()` to update StoreGroup at any time

## Example

```js
context.transaction("A->B->C transaction", transactionContext => {
     return transactionContext.useCase(new ChangeAUseCase()).execute() // no update store
         .then(() => {
             return transactionContext.useCase(new ChangeBUseCase()).execute(); // no update store
         }).then(() => {
             return transactionContext.useCase(new ChangeCUseCase()).execute(); // no update store
         }).then(() => {
             transactionContext.commit(); // update store
             // replay: ChangeAUseCase -> ChangeBUseCase -> ChangeCUseCase
         });
 });
```

## Notes

### Transaction should be commit or exit

Transaction context should be called `commit()` or `exit()`.
Because, this check logic avoid to silent failure of transaction.

And, transaction context should return a promise.
In most case, transaction context should return `transactionContext.useCase(useCase).execute()`.

### Transaction disallow to do multiple commits

A transaction can do a single `commit()`
Not to allow to do multiple commits in a transaction.

Use multiple transaction chain insteadof multiple commit in a transaction.

If you want to multiple commit, please file issue with the motivation.

### Transaction is not lock system

The **transaction** does not lock updating of stores.
The **transaction** method that create a new unit of work.

It means that the store may be updated by other unit of work during executing `context.transaction`.
`context.transaction` provide the way for bulk updating.

A Unit of Work promise the order of events in the Unit of Work.
But, This don't promise the order of events between Unit of Works.

```
 -----------------  commit   -----------------
| Unit of Work A |  ------> |                 |
 ----------------           |    StoreGroup   |
 -----------------  commit  |                 |
| Unit of Work B |  ------> |                 |
 ----------------            -----------------
```

Current implementation is **READ COMMITTED** of Transaction Isolation Levels.

- <https://en.wikipedia.org/wiki/Isolation_(database_systems)>

### No commit transaction get cancelled

You can write no `commit()` transaction.
This transaction add commitment to the unit of work, but does not `commit()`.

```js
context.transaction("No commit transaction", transactionContext => {
     // No commit - Call `transactionContext.exit()` insteadof `transactionContext.commit()`
     return transactionContext.useCase(new LogUseCase()).execute().then(() => {
         transactionContext.exit();
     });
});
```

As a result, This transaction does not affect to Store.
It means that Store can't received the payload of `LogUseCase`.
Finally, that commitment get cancelled.

It is useful for logging UseCase.
Logging UseCase does not need to update store/view.
It only does log/send data to console/server.

### TODO: rollback is not implemented

Rollback feature is generality implemented in the unit of work.
We want to know actual use case of rollback before implementing this.

----

### `onWillExecuteEachUseCase(handler: (payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void;`


Register `handler` function to Context.
`handler` is called when each useCases will execute.

<b>deprecated</b>
Use `context.events.onWillExecuteEachUseCase` insteadof it.

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


<b>deprecated</b>
Use `context.events.onDispatch` insteadof it.

----

### `onDidExecuteEachUseCase(handler: (payload: DidExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void;`


`handler` is called when each useCases are executed.

<b>deprecated</b>
Use `context.events.onDidExecuteEachUseCase` insteadof it.

----

### `onCompleteEachUseCase(handler: (payload: CompletedPayload, meta: DispatcherPayloadMeta) => void): () => void;`


`handler` is called when each useCases are completed.
This `handler` is always called asynchronously.

<b>deprecated</b>
Use `context.events.onCompleteEachUseCase` insteadof it.

----

### `onErrorDispatch(handler: (payload: ErrorPayload, meta: DispatcherPayloadMeta) => void): () => void;`


`handler` is called when some UseCase throw Error.

Throwing Error is following case:

- Throw exception in a UseCase
- Return rejected promise in a UseCase
- Call `UseCase#throwError(error)`

<b>deprecated</b>
Use `context.events.onErrorDispatch` insteadof it.

----

### `release(): void;`


Release all events handler in Context.
You can call this when no more call event handler

----

