// MIT © 2017 azu
"use strict";
import { Store } from "../../src";

export interface MockStore<T> {
    // mutate state
    updateStateWithoutEmit(newState: T): void;

    // setState
    updateState(newState: T): void;

    // state
    getState(): any;
}

export interface createStoreArg<T> {
    name: string;
    state?: T;
}

/**
 * This helper is for creating Store
 */
export function createStore<T>(arg: createStoreArg<T>) {
    class MockStore extends Store<T | undefined> implements MockStore {
        state: T | undefined;

        constructor() {
            super();
            this.name = arg.name;
            this.state = arg.state;
        }

        /**
         * Update state without emitting
         */
        updateStateWithoutEmit(newState: any) {
            this.state = newState;
        }

        /**
         * Update Store's state
         * alias to setState
         */
        updateState(newState: any) {
            this.setState(newState);
        }

        /**
         * Return current statei
         */
        getState() {
            return this.state;
        }
    }

    return new MockStore();
}
