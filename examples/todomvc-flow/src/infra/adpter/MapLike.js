// @flow
"use strict";
const assert = require("assert");
/*
 ES6 Map like object.
 This is not iterable.
 */
export default class MapLike<K, V> {
    _store: { [key: K]: V };

    constructor(entries: Array<[K, V]> = []) {
        this._store = Object.create(null);
        entries.forEach(entry => {
            assert(Array.isArray(entry), "new MapLike([ [key, value] ])");
            this.set(entry[0], entry[1]);
        });
    }

    /**
     * @returns {Object}
     */
    toJSON(): Object {
        return this._store;
    }

    /**
     * get keys
     * @returns {Array}
     */
    keys(): Array<K> {
        return (Object.keys(this._store): Array<any>);
    }

    /**
     * get values
     * @returns {Array}
     */
    values(): Array<mixed> {
        /* eslint-disable guard-for-in */
        const keys = this.keys();
        const store = this._store;
        const results = [];
        keys.forEach(key => {
            results.push(store[key]);
        });
        return results;
        /* eslint-enable guard-for-in */
    }

    /**
     * @param {string} key
     * @returns {*}
     */
    get(key: K): ?V {
        return this._store[key];
    }

    /**
     * has value of key
     * @param key
     * @returns {boolean}
     */
    has(key: K): boolean {
        return this.get(key) != null;
    }

    /**
     * set value for key
     * @param {string} key
     * @param {*} value
     * @return {MapLike}
     */
    set(key: K, value: V): this {
        this._store[key] = value;
        return this;
    }

    /**
     * delete value for key
     * @param {string} key
     */
    delete(key: K): void {
        delete this._store[key];
    }

    /**
     * clear defined key,value
     * @returns {MapLike}
     */
    clear(): this {
        this._store = Object.create(null);
        return this;
    }
}
