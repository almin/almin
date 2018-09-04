---
id: usecaseexecutor-api
title: UseCaseExecutor
---

<!-- THIS DOCUMENT IS AUTOMATICALLY GENERATED FROM src/*.ts -->
<!-- Please edit src/*.ts and `npm run build:docs:api` -->


## Interface

```typescript
export declare class UseCaseExecutorImpl<T extends UseCaseLike> extends Dispatcher implements UseCaseExecutor<T> {
    useCase: T;
    onReleaseOnce(handler: () => void): void;
    executor(executor: (useCase: Pick<T, "execute">) => any): Promise<void>;
    execute<P extends Arguments<T["execute"]>>(...args: P): Promise<void>;
    release(): void;
}
export {};
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

### `onReleaseOnce(handler: () => void): void;`


Call handler when this UseCaseExecutor will be released

<b>param</b> handler

----

### `executor(executor: (useCase: Pick<T, "execute">) => any): Promise<void>;`


**Stability**: Deprecated(Previously: experimental)

- This feature is subject to change. It may change or be removed in future versions.
- If you inserting in this, please see <https://github.com/almin/almin/issues/193>

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

### Why executor's result always to be undefined?

`execute()` return a Promise that will resolve `undefined` by design.
In CQRS, the command always have returned void type.

- http://cqrs.nu/Faq

So, `execute()` only return command result that is success or failure.
You should not relay on the result value of the useCase#execute.


<b>deprecated</b> Use `execute()` instead of `executor()`
Almin 0.18+ make `execute` type complete.
It will be remove in the future.

Please apply migration scripts:
https://github.com/almin/almin/issues/356

----

### `execute<P extends Arguments<T["execute"]>>(...args: P): Promise<void>;`


Execute UseCase instance.
UseCase is a executable object that has `execute` method.

This method invoke UseCase's `execute` method and return a promise<void>.
The promise will be resolved when the UseCase is completed finished.

### Why executor's result always to be undefined?

`execute()` return a Promise that will resolve `undefined` by design.
In CQRS, the command always have returned void type.

- http://cqrs.nu/Faq

So, `execute()` only return command result that is success or failure.
You should not relay on the result value of the useCase#execute.

## Notes

> Added: Almin 0.17.0+

`execute()` support type check in Almin 0.17.0.
However, it has a limitation about argument lengths.
For more details, please see <https://github.com/almin/almin/issues/107#issuecomment-384993458>

> Added: Almin 0.18.0+

`execute()` support type check completely.
No more need to use `executor()` for typing.

----

### Interface 
```typescript
release(): void;
}
export {
```


release all events handler.
You can call this when no more call event handler

----

