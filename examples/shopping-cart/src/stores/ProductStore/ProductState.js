// LICENSE : MIT
"use strict";
export default class ProductState {
    /**
     * @param {ProductHeader[]} products
     */
    constructor(products = []) {
        /**
         * @type {ProductHeader[]}
         */
        this.products = products;
    }
}
