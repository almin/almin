// LICENSE : MIT
"use strict";
// Cart is Shopping Cart
// Before you bought the product(item), add the product to the cart.
export default class Cart {
    constructor() {
        this.products = [];
    }

    /**
     *
     * @param {Product} product
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