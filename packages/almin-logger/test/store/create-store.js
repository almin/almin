// MIT © 2017 azu
"use strict";
import { Store } from "almin";

export const createStore = () => {
    class TestStore extends Store {
        getState() {
            return {};
        }
    }

    return new TestStore();
};
