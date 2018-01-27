// LICENSE : MIT
"use strict";
import { Store } from "../../src";

export interface CreateEchoStore {
    name?: string;
    echo: any;
}

export function createEchoStore({ name, echo }: CreateEchoStore) {
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
