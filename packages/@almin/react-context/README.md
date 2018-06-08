# @almin/react-context

React Context wrapper for almin.

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @almin/react-context

Requirements:

- React 16.3 >=

## Example

This is a example of `@almin/react-context`.

:memo: Note: [@almin/store-test-helper](../@almin/store-test-helper) is a test helper for creating almin's `Store`.

```ts
import { Context, StoreGroup } from "almin";
import { createStore } from "@almin/store-test-helper";
import { createReactContext } from "@almin/react-context";
// Create Almin context
const context = new Context({
    // StoreGroup has {a, b, c} state
    store: new StoreGroup({
        // createStore is a test helper that create Store instance of Almin
        // initial state of `a` is { value: "a" }
        a: createStore({ value: "a" }),
        b: createStore({ value: "b" }),
        c: createStore({ value: "c" }),
    })
});
// Create React Context that wrap Almin Context
const { Consumer, Provider } = createReactContext(context);
// Use Provider
class App extends React.Component {
    render() {
        return (
            // You should wrap Consumer with Provider
            <Provider>
                {/* Consumer children props is called when Almin's context is changed */}
                <Consumer>
                    {state => {
                        return <ul>
                            <li>{state.a.value}</li>;
                            <li>{state.b.value}</li>;
                            <li>{state.c.value}</li>;
                        </ul>
                    }}
                </Consumer>
            </Provider>
        );
    }
}
```

## Usage

## `createReactContext(AlminContext): { Provider, Consumer }`

`createReactContext` create thee React Components from Almin's `Context` instance.

```ts
import { Context, StoreGroup } from "almin";
import { createStore } from "@almin/store-test-helper";
import { createReactContext } from "@almin/react-context";
// Create Almin context
const context = new Context({
    store: createStore({
        value: "store-initial"
    })
});
// Create React Context from Almin Context
// It return these React Components
const { Provider, Consumer } = createReactContext(context);
```

### `<Provider>`

`<Provider>` component allows `<Consumers>` to subscribe to Almin's context changes.
It is a just wrapper of React Context's Provider.

- [React Context: Provider](https://reactjs.org/docs/context.html#provider)

```ts
class App extends React.Component {
    render() {
        return (
            // You should wrap Consumer with Provider
            <Provider>
                {/* Consumer should be under the Provider */}
                <Consumer>
                    {state => { /* state is result of context.getState() */ }}
                </Consumer>
                <Consumer>
                    {state => { /* state is result of context.getState() */ }}
                </Consumer>
            </Provider>
        );
    }
}
```

Also, you can pass `initialState` to `Provider`.
If you does not pass `initialState`, `Consumer`'s state is `context.getState()` value by default.

```tsx
import { Context, StoreGroup } from "almin";
import { createStore } from "@almin/store-test-helper";
import { createReactContext } from "@almin/react-context";
const context = new Context({
    store: createStore({
        value: "store-initial"
    })
});
const { Consumer, Provider } = createReactContext(context);

class App extends React.Component {
    render() {
        return (
            <Provider initialState={{ value: "props-initial" }}>
                <Consumer>
                    {state => {
                        // value is "props-initial"(not "store-initial")
                        return <p>{state.value}</p>;
                    }}
                </Consumer>
            </Provider>
        );
    }
}
```

### Consumer

`<Consumer>` component subscribes to Almin's context changes.
It is a just wrapper of React Context's Consumer.

- [React Context: Consumer](https://reactjs.org/docs/context.html#consumer)

`<Consumer>` requires a [function as a child](https://reactjs.org/docs/render-props.html#using-props-other-than-render). The function receives the current context value and returns a React node.

```tsx
class App extends React.Component {
    render() {
        return (
            // You should wrap Consumer with Provider
            <Provider>
                {/* Consumer require a function as a children */}
                <Consumer>
                    {state => {
                        /* render something based on the context value */
                        return <p>{state.value}</p>;
                    }}
                </Consumer>
            </Provider>
        );
    }
}
```

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
