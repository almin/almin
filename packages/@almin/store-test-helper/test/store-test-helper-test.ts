import { createStore } from "../src/store-test-helper";
import * as assert from "assert";
import { Store } from "almin";

describe("@almin/store-test-helper", () => {
    describe("createStore", () => {
        it("create(name, state)", () => {
            const initialState = {
                value: "value",
            };
            const store = createStore("TestStore", initialState);
            assert.ok(store instanceof Store);
            assert.strictEqual(store.name, "TestStore");
            assert.deepStrictEqual(store.getState(), initialState);
        });
        it("create(state)", () => {
            const initialState = {
                value: "value",
            };
            const store = createStore(initialState);
            assert.ok(store instanceof Store);
            assert.ok(/MockStore<\d+>/.test(store.name));
            assert.deepStrictEqual(store.getState(), initialState);
        });
    });
});
