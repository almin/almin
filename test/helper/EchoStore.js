// LICENSE : MIT
"use strict";
import { Store } from "../../lib/Store";
export default function createEchoStore({
    name,
    echo
}) {
    class TestStore extends Store {
        constructor() {
            super();
            // overwrite name
            if (name) {
                this.name = name;
            }
        }

        getState() {
            return echo;
        }
    }
    return new TestStore();
}