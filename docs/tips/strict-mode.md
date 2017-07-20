# Strict mode

## What is this?

Strict mode check that updating store/state in `Store#receivePayload`
It means that show warning if update store outside of `Store#receivePayload`.

**OK**:

```js
class AStore extends Store {
    constructor() {
        super();
        this.state = {
            a: "value"
        };
    }

    // Good: Update this store inside of receivePayload
    receivePayload(payload) {
        if (payload.type === "UPDATE_A") {
            this.setState(payload.body);
        }
    }

    getState() {
        return this.state;
    }
}

const store = new AStore();
const storeGroup = new StoreGroup({
    a: store
});
const context = new Context({
    dispatcher: new Dispatcher(),
    store: storeGroup,
    options: {
        strict: true
    }
});
const updateAStoreUseCase = ({ dispatcher }) => {
    return () => {
        dispatcher.dispatch({
            type: "UPDATE_A",
            body: "new value"
        });
    };
};
// No Warning
context.useCase(updateAStoreUseCase).execute().then(() => {
    // do something
});

```

**NG**:

> Warning(Store): AStore can only update own state in AStore#receivePayload in strict mode.
> If you update the state outside of AStore#receivePayload, please check the AStore.

```js
import { Context, Dispatcher, Store, StoreGroup, UseCase } from "almin";

class AStore extends Store {
    constructor() {
        super();
        this.state = {
            a: "value"
        };
    }

    getState() {
        return this.state;
    }
}

const store = new AStore();
const storeGroup = new StoreGroup({
    a: store
});
const context = new Context({
    dispatcher: new Dispatcher(),
    store: storeGroup,
    options: {
        strict: true // strict mode!
    }
});

// This UseCase directly update aStore.
// In other word, aStore is updated store outside of `Store#receivePayload`.
const updateStoreUseCase = ({ dispatcher }) => {
    return () => {
        // Warning: update state outside of receivePayload
        store.setState({
            a: "new value"
        });
    };
};

// Warning: execute and show Warning!!
context.useCase(updateStoreUseCase).execute().then(() => {
  // do something
});
```

## How to enable strict mode?

You can enable **Strict mode** to almin.

```js
import { Context, Dispatcher } from "almin";
const storeGroup = createYourStoreGroup();
const context = new Context({
    dispatcher: new Dispatcher(),
    store: storeGroup,
    options: {
        strict: true
    }
});
```

**Recommenced**: use strict mode.

## Notes

Almin will enable strict mode by default in the future.
A new feature like `Context#transaction` can use only in strict mode.

Strict mode ensure consistency in almin.

## Issue

<!-- textlint-disable -->

If you found unexpected warning, please create [new issue](https://github.com/almin/almin/issues/new).

