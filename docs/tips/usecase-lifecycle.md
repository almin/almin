# UseCase LifeCycle

## LifeCycle events

| Event                    | When                                   | 
|--------------------------|----------------------------------------|
| onWillExecuteEachUseCase | Each UseCase will Execute              |
| onDispatch @1            | UseCase call `this.dispatch(payload)`  |
| onError @1               | UseCase call `this.throw(new Error())` |
| onDidExecuteEachUseCase  | Each UseCase did executed.             |
| onCompleteEachUseCase    | Each UseCase is completed.             |

@1 A single UseCase can call multiple.

See [API Reference](../api/README.md) for details of events.

## What the difference between `onDidExecuteEachUseCase` and `onCompleteEachUseCase`?

Some UseCase's task is **async**.
The difference is came up at the async case.

For example,  We can write `AsyncUseCase` like following: 

[import, AsyncUseCase.js](src/AsyncUseCase.js)

The LifeCycle events of `AsyncUseCase`:

1. Sync call `onWillExecuteEachUseCase`
2. Sync call `onDispatch`
3. Sync call `onDidExecuteEachUseCase`
4. Async call `onCompleteEachUseCase`

Illustrate the lifecycle in the code.

```js
// IMAGE CODE!!!
import {UseCase} from "almin";
export default class AsyncUseCase extends UseCase {
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
```

Always `onCompleteEachUseCase` is called after the `onDidExecuteEachUseCase`.