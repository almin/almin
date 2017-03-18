# UseCaseContext
<!-- THIS DOCUMENT IS AUTOMATICALLY GENERATED FROM src/*.ts -->
<!-- Please edit src/*.ts and `npm run build:docs:api` -->


## Interface

```typescript
export declare class UseCaseContext {
    useCase(useCase: UseCase): UseCaseExecutor;
}
```

----

### export declare class UseCaseContext {


Maybe, `UseCaseContext` is invisible from Public API.

`UseCase#context` return UseCaseContext insteadof Context.
It has limitation as against to Context.
Because, `UseCaseContext` is for `UseCase`, is not for `Context`.

```js
class ParentUseCase extends UseCase {
    execute() {
        this.context; // <= This is a instance of UseCaseContext
    }
}
```

----

### Interface of```typescript
useCase(useCase: UseCase): UseCaseExecutor;
}
```


Create UseCaseExecutor for `useCase`.

It can be used for transaction between UseCases.

### Example

ParentUseCase execute ChildUseCase.
It is called **Nesting UseCase**.

```js
// Parent -> ChildUseCase
export class ParentUseCase extends UseCase {
    execute() {
        // `this.context` is a instance of UseCaseContext.
        return this.context.useCase(new childUseCase()).execute();
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

