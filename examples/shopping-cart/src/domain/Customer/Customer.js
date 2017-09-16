// LICENSE : MIT
"use strict";
const uuid = require("uuid");
export default class Customer {
    constructor({ name }) {
        this.id = uuid();
        this.name = name;
    }

    /**
     * The customer checkout the cart
     * @param {Cart} cart
     * @returns {Promise}
     */
    checkout(cart) {
        return cart.tryToFlush();
    }
}
