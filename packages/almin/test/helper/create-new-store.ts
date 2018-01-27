// MIT © 2017 azu
"use strict";
import { Store } from "../../src";

export interface MockStore {
    // mutate state
    mutableStateWithoutEmit(newState: any): void;

    // setState
    updateState(newState: any): void;

    // state
    getState(): any;
}

/**
 * This helper is for creating Store
 */
export function createStore<T>({ name, state }: { name: string; state?: T }) {
    class MockStore extends Store<T | undefined> implements MockStore {
        state: T | undefined;

        constructor() {
            super();
            this.name = name;
            this.state = state;
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
