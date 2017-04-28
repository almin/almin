# StoreGroup
<!-- THIS DOCUMENT IS AUTOMATICALLY GENERATED FROM src/*.ts -->
<!-- Please edit src/*.ts and `npm run build:docs:api` -->


## Interface

```typescript
export declare class InitializedPayload extends Payload {
    constructor();
}
    constructor(stateStoreMapping: StoreMap<T>);
    protected readonly existWorkingUseCase: boolean;
    protected readonly isInitializedWithStateNameMap: boolean;
    shouldStateUpdate(prevState: any, nextState: any): boolean;
    emitChange(payload?: Payload): void;
    onChange(handler: (stores: Array<Store<T>>) => void): () => void;
    release(): void;
```

----

### Interface of 
```typescript
export declare class InitializedPayload extends Payload {
    constructor();
```


Initialized Payload
This is exported for an unit testing.
DO NOT USE THIS in your application.

----

### `constructor(stateStoreMapping: StoreMap<T>);`


Initialize this StoreGroup with a stateName-store mapping object.

The rule of initializing StoreGroup is that "define the state name of the store".

## Example

Initialize with store-state mapping object.

```js
class AStore extends Store {
    getState() {
        return "a value";
    }
}
class BStore extends Store {
    getState() {
        return "b value";
    }
}
const aStore = new AStore();
const bStore = new BStore();
const storeGroup = new CQRSStoreGroup({
    a: aStore, // stateName: store
    b: bStore
});
console.log(storeGroup.getState());
// { a: "a value", b: "b value" }
```

----

### Interface of 
```typescript
protected readonly existWorkingUseCase: boolean;
protected readonly isInitializedWithStateNameMap: boolean;
```


If exist working UseCase, return true

----

### `shouldStateUpdate(prevState: any, nextState: any): boolean;`


Use `shouldStateUpdate()` to let StoreGroup know if a event is not affected.
The default behavior is to emitChange on every life-cycle change,
and in the vast majority of cases you should rely on the default behavior.
Default behavior is shallow-equal prev/next state.

## Example

If you want to use `Object.is` to equal states, overwrite following.

```js
shouldStateUpdate(prevState, nextState) {
   return !Object.is(prevState, nextState)
}
```

----

### `emitChange(payload?: Payload): void;`


Emit change if the state is changed.
If call with no-arguments, use ChangedPayload by default.

----

### `onChange(handler: (stores: Array<Store<T>>) => void): () => void;`


Observe changes of the store group.

onChange workflow: https://code2flow.com/mHFviS

----

### `release(): void;`


Release all events handler.
You can call this when no more call event handler

----

