// LICENSE : MIT

import { Payload } from "./payload/Payload";
export interface StoreLike {
    // write phase in read-side
    // you can update own state
    receivePayload?(payload: Payload): void;
    // read phase in read-side
    // you should return own state
    getState<T>(): T;
    onChange(onChangeHandler: (hangingStores: Array<StoreLike>) => void): () => void;
    release?(): void;
}
