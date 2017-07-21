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
    onDispatch(handler: (payload: Payload | UserDefinedPayload, meta: DispatcherPayloadMeta) => void): () => void;
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
 .onDispatch(payload => {
     console.log(payload.type);  // "ABC"
     console.log(payload.value); // 42
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
      // Initialize state
      this.state = {
         foo : "bar"
      };
   }

   // Update code here
   receivePayload(payload){
     this.setState(this.state.reduce(payload));
   }

   getState(){
     return this.state;
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


You can implement that update own state.
Update your state with `this.setState`.

```js
class YourStore extends Store {
   constructor(){
      super();
      // Initialize state
      this.state = {};
   }

   // Update code here
   receivePayload(payload){
     this.setState(this.state.reduce(payload));
   }

   getState(){
     return this.state;
   }
}
```

## Strict mode

If strict mode is enabled, you should implement updating logic here.

See <https://almin.js.org/docs/tips/strict-mode.html>

## Write phase in read-side(Store)

`Store#receivePayload` is write phase in read-side, receive tha payload from write-side.
In the almin, UseCase(write-side) dispatch a payload and, Store receive the payload.
You can update the state of the store in the timing.
In other word, you can create/cache the state data for `Store#getState()`

----

### `abstract getState(): State;`


You should be overwrite by Store subclass and return the state of the store.

## Example

```js
class YourStore extends Store {
   constructor(){
      super();
      // initialize state
      this.state = {};
   }
   // Update code here
   receivePayload(payload){
     this.setState(this.state.reduce(payload));
   }
   // return your state
   getState(){
     return this.state;
   }
}
```

## Read phase in read-side(Store)

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

### `onDispatch(handler: (payload: Payload | UserDefinedPayload, meta: DispatcherPayloadMeta) => void): () => void;`


Add `handler`(subscriber) to Store and return unsubscribe function
Store#onDispatch receive only dispatched the Payload by `UseCase#dispatch`.

### Example

```js
class MyStore extends Store {
  constructor(){
    super();
    this.unsubscribe = store.onDispatch((payload, meta) => {
        console.log(payload);
    });
    // ....
}
```

Some UseCase `dispatch` the payload and `Store#onDispatch` catch that.

```js
class MyUseCase extends UseCase{
  execute(){
    this.dispatch({
      type: "test"
    }); // => Store#onDispatch catch this
}
```

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

Basically, you should use `this.setState` insteadof `this.emitChange`

----

### `release(): void;`


Release all event handlers

----

