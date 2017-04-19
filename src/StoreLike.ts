import { Dispatcher } from "./Dispatcher";
/**
 * StoreLike is a interfere for Store and StoreGroup .
 */
export interface StoreLike extends Dispatcher {
    // Return the state
    getState<T>(): T;
    // call the `handler` when the store is changed.
    // pass changing stores to the `handler`
    onChange(handler: (stores: Array<StoreLike>) => void): () => void;
    // release all handler
    release(): void;
}
