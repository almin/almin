# Store
<!-- THIS DOCUMENT IS AUTOMATICALLY GENERATED FROM src/*.ts -->
<!-- Please edit src/*.ts and `npm run build:docs:api` -->


```typescript
export declare abstract class Store extends Dispatcher implements StoreLike {
    static displayName?: string;
    static isStore(v: any): v is Store;
    name: string;
    constructor();
    getState<T>(_prevState?: T): T;
    onChange(cb: (changingStores: Array<StoreLike>) => void): () => void;
    emitChange(): void;
}
```

----

## Interface
```typescript
export declare abstract class Store extends Dispatcher implements StoreLike {
```

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
   getState(){
     return {
         yourStore: this.state
     };
   }
}
```

----

## Interface
```typescript
    static displayName?: string;
```

Set debuggable name if needed.

----

## Interface
```typescript
    static isStore(v: any): v is Store;
```

Return true if the `v` is store like.

----

## Interface
```typescript
    name: string;
```

The name of Store

----

## Interface
```typescript
    constructor();
```

Constructor not have arguments.

----

## Interface
```typescript
    getState<T>(_prevState?: T): T;
```

You should be overwrite by Store subclass.
Next, return state object of your store.

FIXME: mark this as `abstract` property.

----

## Interface
```typescript
    onChange(cb: (changingStores: Array<StoreLike>) => void): () => void;
```

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

## Interface
```typescript
    emitChange(): void;

```

Emit "change" event to subscribers.
If you want to notify changing ot tha store, call `Store#emitChange()`.

----

