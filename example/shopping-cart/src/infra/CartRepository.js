// LICENSE : MIT
"use strict";
import Cart from "../domain/Cart/Cart";
const EventEmitter = require("events");
export class CartRepository extends EventEmitter {
    constructor(database = new Map()) {
        super();
        this._dataSet = database;
    }

    /**
     * @param cartID
     * @returns {Cart}
     */
    findById(cartID) {
        return this._dataSet.get(cartID);
    }

    /**
     * get cart that is last used by customer
     * @param customerID
     * @returns {Cart}
     */
    findLatByCustomer(customerID){
        return this._dataSet.get(customerID);
    }
    /**
     * store instance
     * @param {Cart} cart
     */
    store(cart) {
        this._dataSet.set(cart.id, cart);
        this._dataSet.set(cart.customer.id, cart);
        this.emit("CHANGE", cart);
    }

    /**
     * add listener change event
     * @param {Function} handler
     */
    onChange(handler) {
        this.on("CHANGE", handler);
    }
}
// singleton
export default new CartRepository();