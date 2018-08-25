// MIT © 2018 azu
"use strict";
import { Store } from "almin";

let storeCount = 0;

export interface MockStore<T> extends Store<T> {
    // mutate state
    updateStateWithoutEmit(newState: T): void;

    // setState
    updateState(newState: T): void;

    // state
    getState(): any;
}

/**
 * This helper is for creating Store
 * @example
 * // state only
 * // name is increment number automatically
 * createStore({ value: "state" });
 * // with name
 * createStore("Store Name", { value: "state" });
 *
 */
export function createStore<T>(storeName: string, initialState: T): MockStore<T>;
export function createStore<T>(initialState: T): MockStore<T>;
export function createStore<T>(...args: any[]): MockStore<T> {
    class MockStoreImpl extends Store<T> implements MockStore<T> {
        state: T;
        name: string;

        constructor() {
            super();
            storeCount++;
            if (typeof args[0] === "string") {
                this.name = args[0];
                this.state = args[1];
            } else {
                this.name = `MockStore<${storeCount}>`;
                this.state = args[0];
            }
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
         * Return current state
         */
        getState() {
            return this.state;
        }
    }

    return new MockStoreImpl();
}
