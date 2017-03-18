# Dispatcher
<!-- THIS DOCUMENT IS AUTOMATICALLY GENERATED FROM src/*.d.ts -->
<!-- Please edit src/*.ts and `npm run build:docs:api` -->


























## Interface
```typescript
export declare class Dispatcher extends EventEmitter {
```

Dispatcher is the **central** event bus system.

`Dispatcher` class  have these method.

- `onDispatch(function(payload){ });`
- `dispatch(payload);`

It is similar with EventEmitter of Node.js
But, Dispatcher use `payload` object as arguments.

## Payload

`payload` object must have `type` property.
Following object is a minimal `payload` object.

```json
{
    "type": "type"
}
```

Also, You can put any property to payload object.

```json
{
    "type": "show",
    "value": "value"
}
```

### FAQ

Q. Why Almin use `payload` object instead `emit(key, ...args)`?

A. It is for optimization and limitation.
If apply emit style, we should cast `...args` for passing other dispatcher at every time.
So, Almin use `payload` object instead of it without casting.

----









## Interface
```typescript
    static isDispatcher(v: any): v is Dispatcher;
```

if `v` is instance of Dispatcher, return true

----









## Interface
```typescript
    constructor();
```

constructor not have arguments.

----









## Interface
```typescript
    onDispatch(handler: (payload: DispatchedPayload, meta: DispatcherPayloadMeta) => void): () => void;
```

Add `handler`(subscriber) to Dispatcher and return unsubscribe function

### Example

```js
const dispatcher = new Dispatcher();
const unsubscribe = dispatcher.onDispatch((payload, meta) => {});
unsubscribe(); // release handler
```

----









## Interface
```typescript
    dispatch(payload: DispatchedPayload, meta?: DispatcherPayloadMeta): void;
```

Dispatch `payload` to subscribers.

----









## Interface
```typescript
    pipe(toDispatcher: Dispatcher): () => void;

```

Delegate payload object to other dispatcher.

### Example

```js
const a = new Dispatcher();
const b = new Dispatcher();
// Delegate `a` to `b`
a.pipe(b);
// dispatch and `b` can receive it.
a.dispatch({ type : "a" });
```

----


