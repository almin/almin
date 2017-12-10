---
id: usecase-api
title: UseCase
---

<!-- THIS DOCUMENT IS AUTOMATICALLY GENERATED FROM src/*.ts -->
<!-- Please edit src/*.ts and `npm run build:docs:api` -->


## Interface

```typescript
export declare abstract class UseCase extends Dispatcher implements UseCaseLike {
    static displayName?: string;
    static isUseCase(v: any): v is UseCase;
    id: string;
    name: string;
    constructor();
    readonly context: UseCaseContext;
    shouldExecute(..._: Array<any>): boolean;
    abstract execute(..._: Array<any>): any;
    dispatch(payload: DispatchedPayload, meta?: DispatcherPayloadMeta): void;
    onError(errorHandler: (error: Error) => void): (this: Dispatcher) => void;
    throwError(error?: Error | any): void;
}
```

----

### `export declare abstract class UseCase extends Dispatcher implements UseCaseLike {`


A `UseCase` class is inherited Dispatcher.
The user implement own user-case that is inherited UseCase class

It similar to ActionCreator on Flux.

### Example

```js
import {UseCase} from "almin";
class AwesomeUseCase extends UseCase {
   execute(){
      // implementation own use-case
  }
}
```

----

### `static displayName?: string;`


Debuggable name if it needed

----

### `static isUseCase(v: any): v is UseCase;`


Return true if the `v` is a UseCase-like.

----

### `id: string;`


Unique id in each UseCase instances.

----

### `name: string;`


The name of the UseCase.

----

### `constructor();`


Constructor not have arguments.

----

### `readonly context: UseCaseContext;`


Get `context` of UseCase.
You can execute sub UseCase using UseCaseContext object.

See following for more details.

- [UseCaseContext](https://almin.js.org/docs/api/UseCaseContext.html)
- [Nesting UseCase](https://almin.js.org/docs/tips/nesting-usecase.html)

### Example

```js
// Parent -> ChildUseCase
export class ParentUseCase extends UseCase {
    execute() {
        // execute child use-case using UseCaseContext object.
        return this.context.useCase(new ChildUseCase()).execute();
    }
}
export class ChildUseCase extends UseCase {
    execute() {
        this.dispatch({
            type: "ChildUseCase"
        });
    }
}
```

----

### `shouldExecute(..._: Array<any>): boolean;`


Should does the UseCase execute?
Return `true` by default

shouldExecute() is invoked before execute() when Executor execute the UseCase.
Currently, if shouldExecute() returns false, then execute() will not be invoked.


<b>returns</b> {boolean}

----

### `abstract execute(..._: Array<any>): any;`


`UseCase#execute()` method should be overwrite by subclass.

### Example

```js
class AwesomeUseCase extends UseCase {
   execute(){
      // implementation own use-case
  }
}
```

----

### `dispatch(payload: DispatchedPayload, meta?: DispatcherPayloadMeta): void;`


Dispatch `payload` object.

`Store` or `Context` can receive the `payload` object.n

----

### `onError(errorHandler: (error: Error) => void): (this: Dispatcher) => void;`


`errorHandler` is called with error when error is thrown.

----

### `throwError(error?: Error | any): void;`


Throw error payload.

You can use it instead of `throw new Error()`
This error event is caught by dispatcher.

----

