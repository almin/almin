// LICENSE : MIT
"use strict";
// Product is a item.
export default class Product {
    /**
     * {"id": 1, "title": "iPad 4 Mini", "price": 500.01, "inventory": 2, "image": "./assets/ipad-mini.png"}
     */
    constructor({id, title, price, inventory, image}) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.inventory = inventory;
        this.image = image;
    }
}