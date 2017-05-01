import { Dispatcher } from "./Dispatcher";
/**
 * StoreLike is a interfere for Store and StoreGroup .
 */
export interface StoreLike<T> extends Dispatcher {
    getState(): T;
    onChange(handler: (stores: Array<StoreLike<any>>) => void): () => void;
    release(): void;
}
