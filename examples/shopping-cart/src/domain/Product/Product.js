// LICENSE : MIT
"use strict";
const uuid = require("uuid");
import ProductItem from "../value/ProductItem";
// Product is a item.
export default class ProductCatalog {
    /**
     * {"id": 1, "title": "iPad 4 Mini", "price": 500.01, "inventory": 2, "image": "./assets/ipad-mini.png"}
     */
    constructor(catalog = {}) {
        this.id = catalog.id;
        this.title = catalog.title;
        this.price = catalog.price;
        this.inventory = catalog.inventory;
        this.image = catalog.image;
    }

    /**
     * pick up product item from backyard.
     * @returns {ProductItem}
     */
    pickupProductItem() {
        if (this.inventory === 0) {
            throw new Error(`${this.title}'s inventory is 0.`);
        }
        this.inventory--;
        return this.toProductItem();
    }

    /**
     * Create new ProductItem value
     * @returns {ProductItem}
     */
    toProductItem() {
        return new ProductItem({
            id: this.id,
            title: this.title,
            price: this.price,
            inventory: this.inventory,
            image: this.image
        });
    }
}
