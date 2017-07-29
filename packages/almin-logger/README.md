# almin-logger [![Build Status](https://travis-ci.org/almin/almin.svg?branch=master)](https://travis-ci.org/almin/almin)

Logger class for [Almin.js](https://github.com/almin/almin "Almin.js")

![logger](https://monosnap.com/file/AqRVq3UAah8riczytsgXHxGb50fwz2.png)

## Feature

- Execution log of UseCase
- Multiple Execution warning log of UseCase
- Changed log of Store
- Nesting log support if the browser support`console.groupCollapsed`.
- Async logging

## Mark meaning

- :rocket: Transaction
- :bookmark: A group like UseCase
- :x: A group that include failure result

## Installation

     npm install almin-logger

Old IE need [console-polyfill](https://github.com/paulmillr/console-polyfill "console-polyfill")

## Usage

```js
import { AlminLogger } from "almin-logger";
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
const logger = new AlminLogger();
// Start logger
logger.startLogging(appContext);
```

See [Examples](./examples) for more details.

## Options:

### `new AlminLogger(options)`

```js
const DefaultOptions = {
    // use `console` object for logging
    console: console,
};
```

### Async

Default: output log asynchronously

- no mixed UseCase/Dispatch log and the other log.

### <del>Sync mode</del>

Sync mode is removed since almin-logger 6.0.

## FAQ

### IE 11 always show un-meaning name like "Dispatch".

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
