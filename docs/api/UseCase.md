# UseCase
<!-- THIS DOCUMENT IS AUTOMATICALLY GENERATED FROM src/*.ts -->
<!-- Please edit src/*.ts and `npm run build:docs:api` -->










## Interface
```typescript
export declare abstract class UseCase extends Dispatcher implements UseCaseLike {
```

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









## Interface
```typescript
    static displayName?: string;
```

Debuggable name if it needed

----









## Interface
```typescript
    static isUseCase(v: any): v is UseCase;
```

Return true if the `v` is a UseCase-like.

----









## Interface
```typescript
    id: string;
```

Unique id in each UseCase instances.

----









## Interface
```typescript
    name: string;
```

The name of the UseCase.

----









## Interface
```typescript
    constructor();
```

Constructor not have arguments.

----









## Interface
```typescript
    readonly context: UseCaseContext;
```

Get `context` of UseCase.
You can execute sub UseCase using UseCaseContext object.

See following for more details.

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









## Interface
```typescript
    execute<R>(..._: Array<any>): R;
```

`UseCase#execute()` method should be overwrite by subclass.

### Example

```js
class AwesomeUseCase extends UseCase {
   execute(){
      // implementation own use-case
  }
}
```

 FIXME: mark this as `abstract` property.

----









## Interface
```typescript
    dispatch(payload: DispatchedPayload, meta?: DispatcherPayloadMeta): void;
```

Dispatch `payload` object.

`Store` or `Context` can receive the `payload` object.n

----









## Interface
```typescript
    onError(errorHandler: (error: Error) => void): (this: Dispatcher) => void;
```

`errorHandler` is called with error when error is thrown.

----









## Interface
```typescript
    throwError(error?: Error | any): void;

```

Throw error payload.

You can use it instead of `throw new Error()`
This error event is caught by dispatcher.

----


