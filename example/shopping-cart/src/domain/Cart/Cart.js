// LICENSE : MIT
"use strict";
const uuid = require("uuid");
// Cart is Shopping Cart
// Before you bought the product(item), add the product to the cart.
export default class Cart {
    constructor() {
        this.id = uuid();
        this.products = [];
    }

    /**
     *
     * @param {ProductHeader} product
     */
    addItem(product) {
        this.products.push(product);
    }

    /**
     * checkout the cart and (pay money) and flush cart
     */
    checkout() {

    }
}