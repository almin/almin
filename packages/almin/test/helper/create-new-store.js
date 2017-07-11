// MIT © 2017 azu
"use strict";
import { Store } from "../../lib/Store";
/**
 * This helper is for creating Store
 * @param {string} name
 * @param {*} state
 * @returns {TestStore}
 */
export function createStore({ name, state }) {
    class MockStore extends Store {
        constructor() {
            super();
            this.name = name;
            this.state = state || "value";
        }

        updateState(newState) {
            this.state = newState;
        }

        getState() {
            return this.state;
        }
    }
    return new MockStore();
}
