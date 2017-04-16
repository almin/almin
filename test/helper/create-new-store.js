// MIT © 2017 azu
"use strict";
import { Store } from "../../lib/Store";
/**
 * This helper is for CQRSStoreGroup
 * Difference `getState` return a instance of State.
 * @param {string} name
 * @param {*} state
 * @returns {TestStore}
 */
export function createStore({
    name,
    state
}) {
    class NNNStore extends Store {
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
    return new NNNStore();
}
