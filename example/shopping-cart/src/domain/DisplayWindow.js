// LICENSE : MIT
"use strict";
export default class DisplayWindow {
    constructor() {
        this.products = [];
    }

    /**
     * @param {Product[]} products
     */
    setupProducts(products) {
        this.products = products;
    }

    /**
     * pick up the item
     * @param productID
     */
    pickupProduct(productID) {
        return this.products.filter(product => product.id === productID)[0];
    }
}