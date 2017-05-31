// LICENSE : MIT
"use strict";
import Customer from "../domain/Customer/Customer";

const EventEmitter = require("events");

export class CustomerRepository extends EventEmitter {
    constructor(database = new Map()) {
        super();
        this._dataSet = database;
    }

    /**
     * Limitation: This application is for single customer
     * This method return a customer who is current user.
     * @returns {Customer}
     */
    get() {
        return this._dataSet.get("current");
    }

    /**
     * @param id
     * @returns {Customer}
     */
    findById(id) {
        return this._dataSet.get(id);
    }

    /**
     * store instance
     * @param {Customer} customer
     */
    store(customer) {
        this._dataSet.set(customer.id, customer);
        this._dataSet.set("current", customer);
        this.emit("CHANGE", customer);
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
export default new CustomerRepository();
