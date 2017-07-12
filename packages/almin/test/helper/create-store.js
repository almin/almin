// MIT © 2017 azu
"use strict";
import { Store } from "../../lib/Store";
/**
 * @param {string} name
 * @param {*} state
 * @returns {TestStore}
 * @deprecated This store is old style
 */
export function createStore({ name, state }) {
    class TestStore extends Store {
        constructor() {
            super();
            this.name = name;
            this.state = state || "value";
        }

        updateState(newState) {
            this.state = newState;
        }

        getState() {
            return {
                [name]: this.state
            };
        }
    }
    return new TestStore();
}
