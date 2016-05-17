# almin-logger

Logger class for [Almin.js](https://github.com/azu/almin "Almin.js")

![logger](https://monosnap.com/file/hrgv2Vo1Uec5o4RXBD5APMn8FCKEIC.png)

## Feature

- Execution log of UseCase
- Multiple Execution warning log of UseCase
- Changed log of Store
- Nesting log support if the browser support`console.groupCollapsed`.

## Installation

     npm install almin-logger

## Usage

```js
import ContextLogger from "./utils/ContextLogger";
// your store
import AppStore from "./stores/AppStore";
// context
import {Context, Dispatcher}  from "almin";
// instances
const dispatcher = new Dispatcher();
// context connect dispatch with stores
const appContext = new Context({
    dispatcher,
    store: AppStore.create()
});
// Create Logger
const logger = new ContextLogger();
// Start logger
logger.startLogging(appContext);
```

## Options:

### `new ContextLogger(options)`

```js
const DefaultOptions = {
    // output log asynchronously
    async: true,
    // use `console` object for logging
    console: console,
    // message template object
    templates: DefaultTemplates
};
```

### Async mode

Default: output log asynchronously

**Pros**

- no mixed UseCase/Dispatch log and the other log.

**Cons**

- Async log may confuse

### Sync mode

Set `async: false` to options.

```js
// Create Logger
const logger = new ContextLogger({
    async: false
});
// Start logger
logger.startLogging(appContext);
```

**Pros**

- mixed UseCase/Dispatch log and the other log.
- time-series logging
    - A `groupCollapsed` contain the error that is occurred during executing A UseCase. 

**Cons**

- mixed UseCase/Dispatch log and the other log.
- It make confuse.

## Tests

    npm test

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT