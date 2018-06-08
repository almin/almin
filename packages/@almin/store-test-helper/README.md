# @almin/store-test-helper

Create Store helper for testing.

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @almin/store-test-helper

## Usage

```ts
import { Store } from "almin";
export interface MockStore<T> extends Store<T> {
    updateStateWithoutEmit(newState: T): void;
    updateState(newState: T): void;
    getState(): any;
}
/**
 * This helper is for creating Store
 * @example
 * // state only
 * // name is increment number automatically
 * createStore({ value: "state" });
 * // with name
 * createStore("Store Name", { value: "state" });
 *
 */
export declare function createStore<T>(storeName: string, initialState: T): MockStore<T>;
export declare function createStore<T>(initialState: T): MockStore<T>;
```

### Example

```ts
const initialState = {
    value: "value"
};
const store = createStore("TestStore", initialState);
assert.ok(store instanceof Store);
assert.strictEqual(store.name, "TestStore");
assert.deepStrictEqual(store.getState(), initialState);
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
