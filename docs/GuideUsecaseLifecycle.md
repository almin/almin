---
id: usecase-lifecycle
title: "UseCase LifeCycle"
---

Almin has life-cycle events.
These events are useful for logging like [almin-logger](https://www.npmjs.com/package/almin-logger "almin-logger").

For more information about logging, see [Logging tips](./GuideLogging.md).

## LifeCycle events

| Event                    | When                                   | 
|--------------------------|----------------------------------------|
| onBeginTransaction       | A transaction begin                    |
| onEndTransaction         | A transaction end                      |
| onWillNotExecuteEachUseCase | A UseCase will not Execute          |
| onWillExecuteEachUseCase | Each UseCase will Execute              |
| onDispatch @1            | UseCase call `this.dispatch(payload)`  |
| onErrorDispatch @1       | UseCase call `this.throwError(new Error())` |
| onDidExecuteEachUseCase  | Each UseCase did executed              |
| onCompleteEachUseCase    | Each UseCase is completed              |

@1 A single UseCase can call multiple.

For more details, see [LifeCycleEventHub · API Reference](https://almin.js.org/docs/en/lifecycleeventhub-api.html).

## What the difference between `onDidExecuteEachUseCase` and `onCompleteEachUseCase`?

Some UseCase's task is **async**.
The difference is came up at the async case.

For example,  We can write `AsyncUseCase` like following: 

```js
import { UseCase } from "almin";
export class AsyncUseCase extends UseCase {
    execute() {
        this.dispatch({ type: "start" });
        return Promise.resolve().then(() => {
            // does async function
        });
    }
}
```

The LifeCycle events of `AsyncUseCase`:

1. Sync call `onWillExecuteEachUseCase`
2. Sync call `onDispatch`
3. Sync call `onDidExecuteEachUseCase`
4. Async call `onCompleteEachUseCase`

Illustrate the lifecycle in the code.

```js
// IMAGE CODE!!!
import {UseCase} from "almin";
export class AsyncUseCase extends UseCase {
    // 1. call onWillExecuteEachUseCase
    execute() {
        // 2. call onDispatch
        this.dispatch({ type : "start" });
        return Promise.resolve().then(() => {
            // does async function
        }).then(() => {
            // 4. call onCompleteEachUseCase
        });
    }
    // 3. call onDidExecuteEachUseCase
}
// listen on*
context.events.onWillExecuteEachUseCase((payload, meta) => {});
context.events.onDispatch((payload, meta) => {});
context.events.onDidExecuteEachUseCase((payload, meta) => {});
context.events.onCompleteEachUseCase((payload, meta) => {});
```

`onCompleteEachUseCase` is always called after the `onDidExecuteEachUseCase`.
