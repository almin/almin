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

export const isCreateStoreArg = (arg: any): arg is createStoreArg<any> => {
    return typeof arg === "object" && typeof arg.name === "string" && !("state" in arg);
};

export interface createStoreArg<T> {
    name: string;
    state?: T;
}

/**
 * This helper is for creating Store
 * @example
 * // state only
 * // name is increment number automatically
 * createStore({ value: "state" });
 * // with name
 * createStore({ name: "store name", state: { value: "state" } });
 *
 */
export function createStore<T>(arg: T | createStoreArg<T>): MockStore<T> {
    class MockStoreImpl extends Store<T | undefined> implements MockStore<T> {
        state: T | undefined;
        name: string;

        constructor() {
            super();
            storeCount++;
            if (isCreateStoreArg(arg)) {
                this.name = arg.name;
                this.state = arg.state;
            } else {
                this.name = `MockStore<${storeCount}>`;
                this.state = arg;
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
