// LICENSE  = MIT
"use strict";
export default class ProductItem {
    /**
     * @param {Number} catalogNumber
     * @param {string} title
     * @param {Number} price
     * @param {Number} inventory
     * @param {string} image
     */
    constructor({catalogNumber, title, price, inventory, image}) {
        this.id = catalogNumber;
        this.title = title;
        this.price = price;
        this.inventory = inventory;
        this.image = image;
    }
}