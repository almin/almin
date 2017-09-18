# Performance profile

You can profiling UseCase execute, StoreGroup write/read, Store update using the browser developer tool timeline.

The example of profiling result.

![performance-timeline.png](./img/performance-timeline.png)

## Metrics


| Mark                     | Duration                                 |
| ------------------------ | ---------------------------------------- |
| `[Transaction]`          | From begin to end of `Context#transaction` |
| `[StoreGroup#read]`      | `StoreGroup` read state from all stores(Total of `Store#getState`) |
| `[StoreGroup#write]`     | `StoreGroup` write payload to all stores(Total of `Store#receivePayload`) |
| `[Store#getState]`       | The time is spent of `Store#getState ` for each Store |
| `[Store#receivePayload]` | The time is pent of  `Store#receivePayload` for each Store |
| `[UserCase#execute]`     | From **will execute** to **did executed** for each UseCase |
| `[UserCase#complete]`    | From **did execute** to **complete** for each UseCase |


Related: [UseCase LifeCycle](./usecase-lifecycle.md)

## How to enable?

You can turn on performance profile by `performanceProfile` option. 

```js
const appContext = new Context({
    dispatcher: new Dispatcher(),
    store: yourStoreGroup,
    options: {
        strict: true,
        performanceProfile: true
    }
});
```

Turn on by `process.env.NODE_ENV`.

```js
const appContext = new Context({
    dispatcher: new Dispatcher(),
    store: yourStoreGroup,
    options: {
        strict: true,
        performanceProfile: process.env.NODE_ENV !== "production"
    }
});
```

## Related

- [UseCase LifeCycle](./usecase-lifecycle.md)

## Similar options

- [Vue.js](https://vuejs.org/v2/api/#performance "Vue.js")'s `performance` options
- [React](https://facebook.github.io/react/ "React - A JavaScript library for building user interfaces") and`?react_perf`
    - [Optimizing Performance - React](https://facebook.github.io/react/docs/optimizing-performance.html "Optimizing Performance - React")