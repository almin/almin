<style>
h2 { 
    border-bottom: 1px solid gray;
}
</style>

Almin's API Reference.

See also [Component of Almin](../abstract).

# API Reference

## `DispatcherPayload`

**Extends EventEmitter**

payload The payload object that must have `type` property.

**Properties**

-   `type` **Any** The event type to dispatch.

## `Dispatcher`

**Extends EventEmitter**

Dispatcher is the **central** event bus system.

also have these method.

-   `onDispatch(function(payload){  });`
-   `dispatch(payload);`

Almost event pass the (on)dispatch.

#### FAQ

Q. Why use `DispatcherPayload` object instead emit(key, ...args).

A. It is for optimization and limitation.
If apply emit style, we cast ...args for passing other dispatcher at every time.

### `onDispatch(payloadHandler: function (payload: DispatcherPayload)): Function`

add onAction handler and return unbind function

**Parameters**

-   `payloadHandler`: **function (payload: DispatcherPayload)**

Returns: **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** - call the function and release handler

### `dispatch(payload: DispatcherPayload)`

dispatch action object.
StoreGroups receive this action and reduce state.

**Parameters**

-   `payload`: **DispatcherPayload**

### `pipe(toDispatcher: Dispatcher): Function`

delegate payload object to other dispatcher.

**Parameters**

-   `toDispatcher`: **Dispatcher**

Returns: **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** - call the function and release handler

### `isDispatcher(v: (Dispatcher | Any)): boolean`

if [v](v) is instance of Dispatcher, return true

**Parameters**

-   `v`: **(Dispatcher | Any)**

Returns: **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**

## `defaultStoreName`

A UseCase `dispatch(payload)` and subscribers of the dispatcher are received the payload.

**Examples**

```javascript
abcUseCase
 .dispatch({
     type: "ABC",
     value: "value"
 })

abcStore
 .onDispatch(({ type, value }) => {
     console.log(type);  // "ABC"
     console.log(value); // 42
 });
```

## `Store`

**Extends Dispatcher**

Store class

### `getState(prevState: Object): Object`

should be overwrite. return state object

**Parameters**

-   `prevState`: **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)**

Returns: **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** - nextState

### `onError(handler: function (payload: UseCaseErrorPayload)): Function`

invoke `handler` when UseCase throw error events.

**Parameters**

-   `handler`: **function (payload: UseCaseErrorPayload)**

**Examples**

```javascript
store.onError(payload => {
 const useCase = payload.useCase;
 if(useCase instanceof AUseCase){
     // do something
 }
}):
```

Returns: **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** - call the function and release handler

### `onChange(cb: Function): Function`

subscribe change event of the state(own).
if emit change event, then call registered event handler function

**Parameters**

-   `cb`: **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)**

Returns: **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** - call the function and release handler

### `emitChange()`

emit "change" event to subscribers

### `isStore(v: Any): boolean`

return true if the `v` is store.

**Parameters**

-   `v`: **Any**

Returns: **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**

## `StoreGroup`

**Extends Dispatcher**

StoreGroup is a **UI** parts of Store.
StoreGroup has event queue system.
It means that StoreGroup thin out change events of stores.
If you want to know all change events, and directly use `store.onChange()`.

### `constructor(stores: Array<Store>)`

Create StoreGroup

**Parameters**

-   `stores`: **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Store>** - stores are instance of `Store` class

### `getState(): Object`

return the state object that merge each stores's state

Returns: **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** - merged state object

### `emitChange()`

emit Change Event

### `onChange(handler: function (stores: Array<Store>)): Function`

listen changes of the store group.

**Parameters**

-   `handler`: **function (stores: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Store>)** - the callback arguments is array of changed store.

Returns: **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** - call the function and release handler

### `release()`

release all events handler.
You can call this when no more call event handler

## `QueuedStoreGroup`

**Extends Dispatcher**

### Description

-   QueuedStoreGroup is a **UI** parts of Store.
-   QueuedStoreGroup has event queue system.
-   QueuedStoreGroup not dependent on async function like `setTimeout`.
-   QueuedStoreGroup work as Sync or Async.
-   QueuedStoreGroup prefer strict design than ./StoreGroup.js

### Checking Algorithm

QueuedStoreGroup check changed stores and `QueuedStoreGroup#emitChange()` (if necessary) on following case:

-   when receive `didExecutedUseCase` events
-   when receive events by `UseCase#dispatch`
-   when receive events by `UseCase#throwError`

### Note

-   QueuedStoreGroup not allow to change **stores** directly.
-   Always change **stores** via execution of UseCase.
-   QueuedStoreGroup has not cache state.
-   Cache system should be in your Store.

### `constructor(stores: Array<Store>, options: [Object])`

Create StoreGroup

**Parameters**

-   `stores`: **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Store>** - stores are instance of `Store` class
-   `options`: **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** - QueuedStoreGroup option

### `getState(): Object`

return the state object that merge each stores's state

Returns: **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** - merged state object

### `emitChange()`

emit change event

### `onChange(handler: function (stores: Array<Store>)): Function`

listen changes of the store group.

**Parameters**

-   `handler`: **function (stores: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Store>)** - the callback arguments is array of changed store.

Returns: **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** - call the function and release handler

### `release()`

release all events handler.
You can call this when no more call event handler

## `UseCase`

**Extends Dispatcher**

UseCase class

### `context`

getter to get context of UseCase

Returns: **UseCaseContext** - the UseCaseContext has `execute()` method

### `onError(errorHandler: function (error: Error)): function (this: Dispatcher)`

called the `errorHandler` with error when error is occurred.

**Parameters**

-   `errorHandler`: **function (error: [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error))**

Returns: **function (this: Dispatcher)**

### `throwError(error: Error)`

throw error event
you can use it instead of `throw new Error()`
this error event is caught by dispatcher.

**Parameters**

-   `error`: **[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)**

### `UseCaseErrorPayload`

payload object that is dispatched when UseCase is failing or `throwError`.

**Parameters**

-   `error`

**Properties**

-   `type` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The event type of error.
-   `useCase` **UseCase** useCase instance
-   `error` **[error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)** error object that is thrown from UseCase

### `isUseCase(v: Any): boolean`

return true if the `v` is UseCase .

**Parameters**

-   `v`: **Any**

Returns: **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**

## `Context`

### `constructor({ dispatcher, store })`

**Parameters**

-   `dispatcher`: **Dispatcher**
-   `store`: **(QueuedStoreGroup | StoreGroup | Store)** - store is either Store or StoreGroup

### `getState(): Any`

return state value of StoreGroup.

Returns: **Any** - states object of stores

### `onChange(onChangeHandler: function (changingStores: Array<Store>)): Function`

if anyone store is changed, then call onChangeHandler

**Parameters**

-   `onChangeHandler`: **function (changingStores: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Store>)**

Returns: **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** - release handler function.

### `useCase(useCase: UseCase): UseCaseExecutor`

**Parameters**

-   `useCase`: **UseCase**

**Examples**

```javascript
context.useCase(UseCaseFactory.create()).execute(args);
```

Returns: **UseCaseExecutor**

### `onWillExecuteEachUseCase(handler: function (useCase: UseCase, args: Any))`

called the [handler](handler) with useCase when the useCase will do.

**Parameters**

-   `handler`: **function (useCase: UseCase, args: Any)**

### `onDispatch(handler: function (payload: DispatcherPayload)): Function`

called the `handler` with user-defined payload object when a UseCase dispatch with payload.
This `onDispatch` is not called at built-in event. It is filtered by Context.
If you want to _All_ dispatched event and use listen directly your `dispatcher` object.
In other word, listen the dispatcher of `new Context({dispatcher})`.

**Parameters**

-   `handler`: **function (payload: DispatcherPayload)**

Returns: **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)**

### `onDidExecuteEachUseCase(handler: function (useCase: UseCase))`

called the `handler` with useCase when the useCase is executed..

**Parameters**

-   `handler`: **function (useCase: UseCase)**

### `onCompleteEachUseCase(handler: function (useCase: UseCase))`

called the `handler` with useCase when the useCase is completed.

**Parameters**

-   `handler`: **function (useCase: UseCase)**

### `onErrorDispatch(errorHandler: function (payload: UseCaseErrorPayload)): function (this: Dispatcher)`

called the `errorHandler` with error when error is occurred.

**Parameters**

-   `errorHandler`: **function (payload: UseCaseErrorPayload)**

Returns: **function (this: Dispatcher)**

### `release()`

release all events handler.
You can call this when no more call event handler
