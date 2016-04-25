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