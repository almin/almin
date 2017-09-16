// LICENSE : MIT
"use strict";
const uuid = require("uuid");
import { checkoutProducts } from "../../utils/WebAPIUtils";
// Cart is Shopping Cart
// Before you bought the product(item), add the product to the cart.
export default class Cart {
    /**
     * @param {Customer} customer
     */
    constructor({ customer }) {
        this.id = uuid();
        /**
         * @type {ProductItem[]}
         */
        this.products = [];
        this.customer = customer;
    }

    /**
     *
     * @param {ProductItem} product
     */
    addItem(product) {
        this.products = this.products.concat(product);
    }

    /**
     * @returns {ProductItem[]}
     */
    getAllProductItems() {
        return this.products;
    }

    /**
     * checkout the cart and (pay money) and flush cart
     */
    tryToFlush() {
        return checkoutProducts(this.products).then(() => {
            this.products = [];
        });
    }
}
