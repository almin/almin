// LICENSE : MIT

export interface StoreLike {
    getState<T>(): T;
    onChange(onChangeHandler: (hangingStores: Array<StoreLike>) => void): void;
    release?(): void;
}