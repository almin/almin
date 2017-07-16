// MIT © 2017 azu
"use strict";
import { Store } from "../../src/Store";

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

        /**
         * Directly modify state
         */
        mutableStateWithoutEmit(newState) {
            this.state = newState;
        }

        /**
         * setState
         * @param {*} newState
         */
        updateState(newState) {
            this.setState(newState);
        }

        getState() {
            return this.state;
        }
    }

    return new MockStore();
}
