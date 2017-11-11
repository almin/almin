# almin-react-container

React bindings for Almin.

## Install

Install with [npm](https://www.npmjs.com/):

    npm install almin-react-container

## Usage

### `create(component, context): React.Component`

It create container component that is wrap `component`.

The `component` can receive `context.getState` of Almin via `this.props`.

```js
import React from "react";
import ReactDOM from "react-dom";
import AlminReactContainer from "almin-react-container";
import { Dispatcher, Context, Store } from "almin";
// Store
class MyState {
    constructor({value}) {
        this.value = value;
    }
}
class MyStore extends Store {
    constructor() {
        super();
        this.state = new MyState({
            value: "Hello World!"
        });
    }

    getState() {
        return {
            myState: this.state
        };
    }
}
// Context
const context = new Context({
    dispatcher: new Dispatcher(),
    store: new MyStore()
});

// context.getState();
/*
{
    myState
}
*/
// View
class App extends React.Component {
    render() {
        // this.props has the same with `context.getState()`
        return <div>{this.props.myState.value}</div>
    }
}
// Create Container
const RootContainer = AlminReactContainer.create(App, context);
// Render Container
ReactDOM.render(<RootContainer />, document.getElementById("js-app"));
```

For more details, see [Example/](./example/).

For TypeScript user, see [almin-react-container-test.tsx](./test/almin-react-container-test.tsx).

## Changelog

See [Releases page](https://github.com/almin/almin/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm i -d && npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/almin/almin/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
