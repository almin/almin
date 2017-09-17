import { Dispatcher } from "./Dispatcher";
/**
 * StoreLike is a interfere for Store and StoreGroup.
 *
 * Note: receivePayload is not in this, because Store#receivePayload is not a part of StoreGroup.
 */
export interface StoreLike<T = any> extends Dispatcher {
    // The name of the Store.
    name: string;
    // Return the state
    getState(): T;
    // call the `handler` when the store is changed.
    // pass changing stores to the `handler`
    onChange(handler: (stores: Array<StoreLike<any>>) => void): () => void;
    // release all handler
    release(): void;
}
