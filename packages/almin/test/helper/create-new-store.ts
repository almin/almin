// MIT © 2017 azu
"use strict";
import { Store } from "../../src/Store";

/**
 * This helper is for creating Store
 */
export function createStore({ name, state }: { name: string; state?: any }) {
    class MockStore extends Store {
        constructor() {
            super();
            this.name = name;
            this.state = state || "value";
        }

        /**
         * Directly modify state
         */
        mutableStateWithoutEmit(newState: any) {
            this.state = newState;
        }

        /**
         * setState
         * @param {*} newState
         */
        updateState(newState: any) {
            this.setState(newState);
        }

        getState() {
            return this.state;
        }
    }

    return new MockStore();
}
