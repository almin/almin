# @almin/react-context

React Context wrapper for almin.

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @almin/react-context

## Example

This is a example of `@almin/react-context`.

:memo: Note: [create-test-store.ts](./test/helper/create-test-store.ts) is a test helper

```ts
import { Context, StoreGroup } from "almin";
import { createReactContext } from "@almin/react-context";
// Create Almin context
const context = new Context({
    // StoreGroup has {a, b, c} state
    store: new StoreGroup({
        // createTestStore is a test helper that create Store instance of Almin
        // See /test/helper/create-test-store.ts
        a: createTestStore({ value: "a" }),
        b: createTestStore({ value: "b" }),
        c: createTestStore({ value: "c" }),
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

## `createReactContext(AlminContext): { Provider, Consumer, ConsumerQuery }`

`createReactContext` create thee React Components from Almin's `Context` instance.

```ts
import { Context, StoreGroup } from "almin";
import { createReactContext } from "@almin/react-context";
// Create Almin context
const context = new Context({
    store: createTestStore({
        value: "store-initial"
    })
});
// Create React Context from Almin Context
// It return these React Components
const { Provider, Consumer, ConsumerQuery } = createReactContext(context);
```

### Provider

### Consumer

### ConsumerQuery

`ConsumerQuery` is Consumer + Query component.
It can select some state from whole state.

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
