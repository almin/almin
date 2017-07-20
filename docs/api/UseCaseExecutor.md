# UseCaseExecutor
<!-- THIS DOCUMENT IS AUTOMATICALLY GENERATED FROM src/*.ts -->
<!-- Please edit src/*.ts and `npm run build:docs:api` -->


## Interface

```typescript
export declare class UseCaseExecutorImpl<T extends UseCaseLike> extends Dispatcher implements UseCaseExecutor<T> {
    useCase: T;
    executor(executor: (useCase: Pick<T, "execute">) => any): Promise<void>;
    execute(): Promise<void>;
    execute<T>(args: T): Promise<void>;
    release(): void;
}
```

----

### `export declare class UseCaseExecutorImpl<T extends UseCaseLike> extends Dispatcher implements UseCaseExecutor<T> {`


`UseCaseExecutor` is a helper class for executing UseCase.

You can not create the instance of UseCaseExecutor directory.
You can get the instance by `Context#useCase(useCase)`,

----

### `useCase: T;`


A executable useCase

----

### `executor(executor: (useCase: Pick<T, "execute">) => any): Promise<void>;`


Similar to `execute(arguments)`, but it accept an executor function insteadof `arguments`
`executor(useCase => useCase.execute())` return a Promise object that resolved with undefined.

This method is type-safe. It is useful for TypeScript.

## Example

```js
context.useCase(new MyUseCase())
 .executor(useCase => useCase.execute("value"))
 .then(() => {
   console.log("test");
 });
```

## Notes

### What is difference between `executor(executor)` and `execute(arguments)`?

The `execute(arguments)` is a alias of following codes:

```js
context.useCase(new MyUseCase())
 .execute("value")
// ===
context.useCase(new MyUseCase())
 .executor(useCase => useCase.execute("value"))
```

### I'm use TypeScript, Should I use `executor`?

Yes. It is type-safe by default.
In other words, JavaScript User have not benefits.

### Why executor's result always to be undefined?

UseCaseExecutor always resolve `undefined` data by design.
In CQRS, the command always have returned void type.

- http://cqrs.nu/Faq

So, Almin return only command result that is success or failure.
You should not relay on the data of the command result.

----

### Interface 
```typescript
execute(): Promise<void>;
execute<T>(args: T): Promise<void>;
```


execute UseCase instance.
UseCase is a executable object that has `execute` method.

This method invoke UseCase's `execute` method and return a promise<void>.
The promise will be resolved when the UseCase is completed finished.

## Notes

The `execute(arguments)` is shortcut of `executor(useCase => useCase.execute(arguments)`

----

### `release(): void;`


release all events handler.
You can call this when no more call event handler

----

