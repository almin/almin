# API Reference

## Dispatcher

### Functions

<dl>
<dt><a href="#isDispatcher">isDispatcher(v)</a> ⇒ <code>boolean</code></dt>
<dd><p>if <a href="v">v</a> is instance of Dispatcher, return true</p>
</dd>
<dt><a href="#onDispatch">onDispatch(payloadHandler)</a> ⇒ <code>function</code></dt>
<dd><p>add onAction handler and return unbind function</p>
</dd>
<dt><a href="#dispatch">dispatch(payload)</a></dt>
<dd><p>dispatch action object.
StoreGroups receive this action and reduce state.</p>
</dd>
<dt><a href="#pipe">pipe(toDispatcher)</a> ⇒ <code>function</code></dt>
<dd><p>delegate payload object to other dispatcher.</p>
</dd>
</dl>

### Typedefs

<dl>
<dt><a href="#DispatcherPayload">DispatcherPayload</a> : <code>Object</code></dt>
<dd><p>payload The payload object that must have <code>type</code> property.</p>
</dd>
</dl>

<a name="isDispatcher"></a>

### isDispatcher(v) ⇒ <code>boolean</code>
if [v](v) is instance of Dispatcher, return true

**Kind**: global function  

| Param | Type |
| --- | --- |
| v | <code>Dispatcher</code> &#124; <code>\*</code> | 

<a name="onDispatch"></a>

### onDispatch(payloadHandler) ⇒ <code>function</code>
add onAction handler and return unbind function

**Kind**: global function  
**Returns**: <code>function</code> - return unbind function  

| Param | Type |
| --- | --- |
| payloadHandler | <code>function</code> | 

<a name="dispatch"></a>

### dispatch(payload)
dispatch action object.
StoreGroups receive this action and reduce state.

**Kind**: global function  

| Param | Type |
| --- | --- |
| payload | <code>[DispatcherPayload](#DispatcherPayload)</code> | 

<a name="pipe"></a>

### pipe(toDispatcher) ⇒ <code>function</code>
delegate payload object to other dispatcher.

**Kind**: global function  
**Returns**: <code>function</code> - un register function  

| Param | Type |
| --- | --- |
| toDispatcher | <code>Dispatcher</code> | 

<a name="DispatcherPayload"></a>

### DispatcherPayload : <code>Object</code>
payload The payload object that must have `type` property.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | The event type to dispatch. |

## Store

### Functions

<dl>
<dt><a href="#getState">getState(prevState)</a> ⇒ <code>Object</code></dt>
<dd><p>implement return state object</p>
</dd>
<dt><a href="#onUseCaseError">onUseCaseError(useCase, handler)</a> ⇒ <code>function</code></dt>
<dd><p>invoke <a href="handler">handler</a> if the <a href="UseCase">UseCase</a> throw error.</p>
</dd>
<dt><a href="#onChange">onChange(cb)</a> ⇒ <code>function</code></dt>
<dd><p>subscribe change event of the state(own).
if emit change event, then call registered event handler function</p>
</dd>
<dt><a href="#emitChange">emitChange()</a></dt>
<dd><p>emit change event to subscribers</p>
</dd>
</dl>

<a name="getState"></a>

### getState(prevState) ⇒ <code>Object</code>
implement return state object

**Kind**: global function  
**Returns**: <code>Object</code> - nextState  

| Param | Type |
| --- | --- |
| prevState | <code>Object</code> | 

<a name="onUseCaseError"></a>

### onUseCaseError(useCase, handler) ⇒ <code>function</code>
invoke [handler](handler) if the [UseCase](UseCase) throw error.

**Kind**: global function  
**Returns**: <code>function</code> - return un-listen function  

| Param | Type |
| --- | --- |
| useCase | <code>UseCase</code> | 
| handler | <code>function</code> | 

<a name="onChange"></a>

### onChange(cb) ⇒ <code>function</code>
subscribe change event of the state(own).
if emit change event, then call registered event handler function

**Kind**: global function  
**Returns**: <code>function</code> - return unbind function  

| Param | Type |
| --- | --- |
| cb | <code>function</code> | 

<a name="emitChange"></a>

### emitChange()
emit change event to subscribers

**Kind**: global function  

## StoreGroup

### Functions

<dl>
<dt><a href="#registerStore">registerStore(store)</a></dt>
<dd><p>register store and listen onChange.
If you release store, and do call <a href="#release">release</a> method.</p>
</dd>
<dt><a href="#requestEmitChange">requestEmitChange()</a></dt>
<dd><p>emitChange if its needed.
Implementation Note:</p>
<ul>
<li>Anyone registered store emitChange, then set <code>this._isChangedStore</code> true.</li>
<li>if <code>this._isChangedStore === true</code>, then <a href="emitChange">emitChange</a>().</li>
</ul>
</dd>
<dt><a href="#release">release()</a></dt>
<dd><p>release all events handler.
You can call this when no more call event handler</p>
</dd>
</dl>

<a name="registerStore"></a>

### registerStore(store)
register store and listen onChange.
If you release store, and do call [release](#release) method.

**Kind**: global function  

| Param | Type |
| --- | --- |
| store | <code>Store</code> | 

<a name="requestEmitChange"></a>

### requestEmitChange()
emitChange if its needed.
Implementation Note:
- Anyone registered store emitChange, then set `this._isChangedStore` true.
- if `this._isChangedStore === true`, then [emitChange](emitChange)().

**Kind**: global function  
<a name="release"></a>

### release()
release all events handler.
You can call this when no more call event handler

**Kind**: global function  


## Context

### Constants

<dl>
<dt><a href="#ActionTypes">ActionTypes</a></dt>
<dd><p>The use should use on* handler method instead of it</p>
</dd>
</dl>

### Functions

<dl>
<dt><a href="#getState">getState()</a> ⇒ <code>*</code></dt>
<dd><p>return state value of StoreGroup.</p>
</dd>
<dt><a href="#onChange">onChange(onChangeHandler)</a> ⇒ <code>function</code></dt>
<dd><p>if anyone store is changed, then call onChangeHandler</p>
</dd>
<dt><a href="#useCase">useCase(useCase)</a> ⇒ <code>UseCaseExecutor</code></dt>
<dd></dd>
<dt><a href="#onWillExecuteEachUseCase">onWillExecuteEachUseCase(handler)</a></dt>
<dd><p>called the <a href="handler">handler</a> with useCase when the useCase will do.</p>
</dd>
<dt><a href="#onDispatch">onDispatch(handler)</a> ⇒ <code>function</code></dt>
<dd><p>called the <a href="handler">handler</a> with user-defined payload object when a UseCase dispatch with payload.
This <code>onDispatch</code> is not called at built-in event. It is filtered by Context.
If you want to <em>All</em> dispatched event and use listen directly your <code>dispatcher</code> object.
In other word, listen the dispatcher of <code>new Context({dispatcher})</code>.</p>
</dd>
<dt><a href="#onDidExecuteEachUseCase">onDidExecuteEachUseCase(handler)</a></dt>
<dd><p>called the <a href="handler">handler</a> with useCase when the useCase is done.</p>
</dd>
<dt><a href="#onErrorDispatch">onErrorDispatch(errorHandler)</a> ⇒ <code>function</code></dt>
<dd><p>called the <a href="errorHandler">errorHandler</a> with error when error is occurred.</p>
</dd>
<dt><a href="#release">release()</a></dt>
<dd><p>release all events handler.
You can call this when no more call event handler</p>
</dd>
</dl>

<a name="ActionTypes"></a>

### ActionTypes
The use should use on* handler method instead of it

**Kind**: global constant  
<a name="getState"></a>

### getState() ⇒ <code>\*</code>
return state value of StoreGroup.

**Kind**: global function  
**Returns**: <code>\*</code> - states object of stores  
<a name="onChange"></a>

### onChange(onChangeHandler) ⇒ <code>function</code>
if anyone store is changed, then call onChangeHandler

**Kind**: global function  
**Returns**: <code>function</code> - release handler function.  

| Param | Type |
| --- | --- |
| onChangeHandler | <code>function</code> | 

<a name="useCase"></a>

### useCase(useCase) ⇒ <code>UseCaseExecutor</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| useCase | <code>UseCase</code> | 

**Example**  
```js
context.useCase(UseCaseFactory.create()).execute(args);
```
<a name="onWillExecuteEachUseCase"></a>

### onWillExecuteEachUseCase(handler)
called the [handler](handler) with useCase when the useCase will do.

**Kind**: global function  

| Param | Type |
| --- | --- |
| handler | <code>function</code> | 

<a name="onDispatch"></a>

### onDispatch(handler) ⇒ <code>function</code>
called the [handler](handler) with user-defined payload object when a UseCase dispatch with payload.
This `onDispatch` is not called at built-in event. It is filtered by Context.
If you want to *All* dispatched event and use listen directly your `dispatcher` object.
In other word, listen the dispatcher of `new Context({dispatcher})`.

**Kind**: global function  

| Param |
| --- |
| handler | 

<a name="onDidExecuteEachUseCase"></a>

### onDidExecuteEachUseCase(handler)
called the [handler](handler) with useCase when the useCase is done.

**Kind**: global function  

| Param | Type |
| --- | --- |
| handler | <code>function</code> | 

<a name="onErrorDispatch"></a>

### onErrorDispatch(errorHandler) ⇒ <code>function</code>
called the [errorHandler](errorHandler) with error when error is occurred.

**Kind**: global function  

| Param | Type |
| --- | --- |
| errorHandler | <code>function</code> | 

<a name="release"></a>

### release()
release all events handler.
You can call this when no more call event handler

**Kind**: global function  

## UseCase

### Members

<dl>
<dt><a href="#context">context</a> ⇒ <code>UseCaseContext</code></dt>
<dd><p>get context of UseCase</p>
</dd>
</dl>

### Functions

<dl>
<dt><a href="#onError">onError(errorHandler)</a> ⇒ <code>function</code></dt>
<dd><p>called the <a href="errorHandler">errorHandler</a> with error when error is occurred.</p>
</dd>
<dt><a href="#throwError">throwError(error)</a></dt>
<dd><p>throw error event
you can use it instead of <code>throw new Error()</code>
this error event is caught by dispatcher.</p>
</dd>
</dl>

<a name="context"></a>

### context ⇒ <code>UseCaseContext</code>
get context of UseCase

**Kind**: global variable  
<a name="onError"></a>

### onError(errorHandler) ⇒ <code>function</code>
called the [errorHandler](errorHandler) with error when error is occurred.

**Kind**: global function  

| Param | Type |
| --- | --- |
| errorHandler | <code>function</code> | 

<a name="throwError"></a>

### throwError(error)
throw error event
you can use it instead of `throw new Error()`
this error event is caught by dispatcher.

**Kind**: global function  

| Param | Type |
| --- | --- |
| error | <code>Error</code> | 

