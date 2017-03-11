# almin-logger [![Build Status](https://travis-ci.org/almin/almin-logger.svg?branch=master)](https://travis-ci.org/almin/almin-logger)

Logger class for [Almin.js](https://github.com/azu/almin "Almin.js")

[![Sauce Test Status](https://saucelabs.com/browser-matrix/almin-logger.svg)](https://saucelabs.com/u/almin-logger)

![logger](https://monosnap.com/file/AqRVq3UAah8riczytsgXHxGb50fwz2.png)


## Feature

- Execution log of UseCase
- Multiple Execution warning log of UseCase
- Changed log of Store
- Nesting log support if the browser support`console.groupCollapsed`.
- Async(by default) and Sync logger

## Installation

     npm install almin-logger

Old IE need [console-polyfill](https://github.com/paulmillr/console-polyfill "console-polyfill")

## Usage

```js
import ContextLogger from "almin-logger";
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

See [Examples](./examples) for more details.

## Options:

### `new ContextLogger(options)`

```js
const DefaultOptions = {
    // output log asynchronously
    async: true,
    // use `console` object for logging
    console: console,
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

## FAQ

### IE 11 always show log like "Dispatch".

IE 11 not have `Function.name`.
almin-logger depended on `Function.name` or `Function.displayName`.

You can resolve this issue by using [babel-plugin-class-display-name](https://www.npmjs.com/package/babel-plugin-class-display-name "babel-plugin-class-display-name").
This plugin set `displayName` to each UseCase class.

## Alternative

- [almin/almin-devtools: Integrate almin into redux-devtools](https://github.com/almin/almin-devtools "almin/almin-devtools: Integrate almin into redux-devtools")

## Tests

In Node.js

    npm test

In Browser

    npm run test:browser

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
