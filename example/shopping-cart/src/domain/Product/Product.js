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
        this.id = uuid();
        this.catalogNumber = catalog.id;
        this.title = catalog.title;
        this.price = catalog.price;
        this.inventory = catalog.inventory;
        this.image = catalog.image;

    }

    /**
     * Create new ProductItem value
     * @returns {ProductItem}
     */
    toProductItem() {
        return new ProductItem({
            catalogNumber: this.catalogNumber,
            title: this.title,
            price: this.price,
            inventory: this.inventory,
            image: this.image
        })
    }
}