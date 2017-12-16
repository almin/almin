---
id: strict-mode
title: "Strict mode"
---

> Strict mode will be enabled by default in the future.

## What is this?

Strict mode check that updating store/state in `Store#receivePayload`
It means that show warning if update store outside of `Store#receivePayload`.

In other word, Strict mode require that your store should be updated in `Store#receivePayload`.

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

## Example

**OK**: Examples of correct code for strict mode:

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
            this.setState(payload.body); // Update!
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

**NG pattern 1**: Examples of incorrect code for strict mode:

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

**NG pattern 2**: Examples of incorrect code for strict mode:

This is similar with Pattern 1(Almost same).
This `Repopository#onChange` is called at different timing with `Store#receivePayload`. 


```js
import { Context, Dispatcher, Store, StoreGroup, UseCase } from "almin";

// observable repository
const REPOSITORY_CHANGE = "REPOSITORY_CHANGE";
export class Repository extends EventEmitter {
    save(entity) {
        this.emit(REPOSITORY_CHANGE, entity);
    }

    onChange(handler) {
        this.on(REPOSITORY_CHANGE, handler);
    }
}
// singleton
const repository = new Repository();

// Store implement use repository
class AStore extends Store {
    constructor({ repository }) {
        super();
        this.state = {
            a: "value"
        };
        
        repository.onChange((entity) => {
            this.setState(entity);
        })
    }

    getState() {
        return this.state;
    }
}

const storeGroup = new StoreGroup({
    a: new AStore({ repository }) // DI
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
        repository.save({
            a: "new value"
        });
    };
};

// Warning: execute and show Warning!!
context.useCase(updateStoreUseCase).execute().then(() => {
  // do something
});
```

## Issue

<!-- textlint-disable -->

If you found unexpected warning, please create [new issue](https://github.com/almin/almin/issues/new).

