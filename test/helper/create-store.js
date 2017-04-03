// MIT © 2017 azu
"use strict";
import { Store } from "../../lib/Store";
/**
 * @param {string} name
 * @returns {TestStore}
 */
export function createStore({
    name
}) {
    class TestStore extends Store {
        constructor() {
            super();
            this.name = name;
        }

        getState() {
            return {
                [name]: "value"
            };
        }
    }
    return new TestStore();
}
