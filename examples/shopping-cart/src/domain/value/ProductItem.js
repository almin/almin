// LICENSE  = MIT
"use strict";
export default class ProductItem {
    /**
     * @param {Number} id
     * @param {string} title
     * @param {Number} price
     * @param {Number} inventory
     * @param {string} image
     */
    constructor({ id, title, price, inventory, image }) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.inventory = inventory;
        this.image = image;
    }
}
