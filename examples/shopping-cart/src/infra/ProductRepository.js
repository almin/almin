// LICENSE : MIT
"use strict";
import Product from "../domain/Product/Product";
const EventEmitter = require("events");
export class ProductRepository extends EventEmitter {
    constructor(database = new Map()) {
        super();
        this._dataSet = database;
    }

    /**
     * @returns {Product[]}
     */
    findAll() {
        return [...this._dataSet.values()];
    }

    /**
     * @param id
     * @returns {Product}
     */
    findById(id) {
        return this._dataSet.get(id);
    }

    /**
     * store instance
     * @param {Product} product
     */
    store(product) {
        this._dataSet.set(product.id, product);
        this.emit("CHANGE", product);
    }

    /**
     * add listener change event
     * @param {Function} handler
     */
    onChange(handler) {
        this.on("CHANGE", handler);
    }

    clear() {
        this.removeAllListeners();
        this._dataSet.clear();
    }
}
// singleton
export default new ProductRepository();
