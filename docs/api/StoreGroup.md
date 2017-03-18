# StoreGroup









## Interface
```typescript
export declare class StoreGroup extends Dispatcher implements StoreLike {
```

StoreGroup is a collection of Store.

## Purposes of StoreGroup

- Throttling change events of Store for UI updating.
- A central manager of stores.

StoreGroup has event queue system.
It means that StoreGroup thin out change events of stores.

If you want to know all change events, and directly use `store.onChange()`.

----












## Interface
```typescript
    constructor(stores: Array<Store>);
```

Initialize `StoreGroup` with `Store` instances

### Example

```js
const aStore = new AStore();
const bStore = new BStore();
// StoreGroup is a group of aStore and bStore.
const storeGroup = new StoreGroup([aStore, bStore]);
```

----








## Interface
```typescript
    readonly store: Array<Store>;
```

A collection of stores in the StoreGroup.

----








## Interface
```typescript
    getState<T>(): T;
```

Return the state object that merge each stores's state

Related: `Context#onChange` use `StoreGroup#getState()`

### Example

```js
const storeGroup = new StoreGroup([aStore, bStore]);
console.log(aStore.getState()); // { aState: aState }
console.log(bStore.getState()); // { bState: bState }
// StoreGroup#getState merge these states.
const state = storeGroup.getState();
console.log(state); // { aState: aState, bState: aState }

```

----




















## Interface
```typescript
    emitChange(): void;
```

Emit change Event to subscribers.
It is same with `Store#emitChange()`

----








## Interface
```typescript
    onChange(handler: (stores: Array<Store>) => void): () => void;
```

subscribe changes of the store group.
It is same with `Store#onChage()`

----








## Interface
```typescript
    release(): void;

```

Release all events handler on StoreGroup.
You can call this when no more needed the StoreGroup.

----


