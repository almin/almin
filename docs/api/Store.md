# Store
<!-- THIS DOCUMENT IS AUTOMATICALLY GENERATED FROM src/*.ts -->
<!-- Please edit src/*.ts and `npm run build:docs:api` -->


## Interface

```typescript
export declare abstract class Store<State = any> extends Dispatcher implements StoreLike<State> {
    static displayName?: string;
    static isStore(v: any): v is Store;
    state?: State;
    name: string;
    constructor();
    receivePayload?(payload: Payload): void;
    abstract getState(): State;
    setState(newState: State): void;
    shouldStateUpdate(prevState: any | State, nextState: any | State): boolean;
    onChange(cb: (changingStores: Array<this>) => void): () => void;
    emitChange(): void;
    release(): void;
}
```

----

### `export declare abstract class Store<State = any> extends Dispatcher implements StoreLike<State> {`


Store hold the state of your application.

Typically, `Store` has a parts of the whole state tree of your application.
`StoreGroup` is the the whole state tree.

It means that `StoreGroup` is a collection of `Store` instances.

A UseCase `dispatch(payload)` and `Store` can receive it.

### Abstraction Code

This is imagination code. (It will not work.)

```js
abcUseCase
 .dispatch({
     type: "ABC",
     value: "value"
 });

abcStore
 .onDispatch(({ type, value }) => {
     console.log(type);  // "ABC"
     console.log(value); // 42
 });
```

We recommenced that implement `Store#receivePayload` insteadof using `Store#onDispatch`.
`Store#receivePayload` is almost same with `Store#onDispatch`.
But, `Store#receivePayload` is more match with Almin's life cycle.

### Example

To implement store, you have to inherit `Store` class.

```js
class YourStore extends Store {
   constructor(){
      super();
      this.state = {
         foo : "bar"
      };
   }

   receivePayload(payload){
     this.setState(this.state.reduce(payload));
   }

   getState(){
     return {
         yourStore: this.state
     };
   }
}
```

----

### `static displayName?: string;`


Set debuggable name if needed.

----

### `static isStore(v: any): v is Store;`


Return true if the `v` is store like.

----

### `state?: State;`


The state of the Store.

----

### `name: string;`


The name of the Store.

----

### `constructor();`


Constructor not have arguments.

----

### `receivePayload?(payload: Payload): void;`


## Write phase in read-side

You can implement that update own state.

Write phase in read-side, receive tha payload from write-side.
In the almin, UseCase(write-side) dispatch a payload and, Store receive the payload.
You can update the state of the store in the timing.
In other word, you can create/cache the state data for `Store#getState()`

----

### `abstract getState(): State;`


## Read phase in read-side

You should be overwrite by Store subclass and return the state of the store.

Read phase in read-side, just return the state of the store.
Store#getState is called at View needed new state.

When the state has updated, the view will be updated.
Usually, use Store#shouldStateUpdate for detecting update of the state.

----

### `setState(newState: State): void;`


Update own state property if needed.
If `this.shouldStateUpdate(currentState, newState)` return true, update `this.state` property with `newState`.

----

### `shouldStateUpdate(prevState: any | State, nextState: any | State): boolean;`


If the prev/next state is difference, should return true.

Use Shallow Object Equality Test by default.
<https://github.com/sebmarkbage/ecmascript-shallow-equal>

----

### `onChange(cb: (changingStores: Array<this>) => void): () => void;`


Subscribe change event of the store.
When `Store#emitChange()` is called, then call subscribers.

### Example

```js
store.onChange((changingStores) => {
   console.log(changingStores); // [store]
});

store.emitChange();
```

----

### `emitChange(): void;`


Emit "change" event to subscribers.
If you want to notify changing ot tha store, call `Store#emitChange()`.

----

### `release(): void;`


Release all event handlers

----

