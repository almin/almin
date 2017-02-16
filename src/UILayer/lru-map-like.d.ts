// FIXME: this is temporary loading hack.
// This should be fixed in lru-map-like,
declare class LRUMapLike<K, V> {
    private _map: any;
    private _LRU: any;
    private _MRU: any;
    private _cur: number;
    private _max: number;
    private _dispose: Function;
    constructor(max: number);

    limit: number;

    onDispose(cb: (key: K, val: V, op: any) => void): this;

    readonly size: number;

    keys(): Array<K>;
    values(): Array<V>;
    forEach<C>(callback: (value: V, key: K) => void): this;
    forEach<C>(callback: (value: V, key: K) => void, ctx: C): C;
    has(key: K): boolean;
    peek(key: K): V | undefined;
    get(key: K): V | undefined;
    set(key: K, val: V): this;
    delete(key: K): this;
    clear(): this;
    toJSON(): Array<[K, V]>;

    private _purge(): void;
    private _promote(): void;
    private _detach(): void;
    private _attach(): void;
}

export default LRUMapLike;