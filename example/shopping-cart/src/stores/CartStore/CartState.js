// LICENSE : MIT
"use strict";
import Cart from "../../domain/Cart/Cart";
export default  class CartState {
    /**
     * @param {Cart} [cart]
     */
    constructor(cart = {}) {
        /**
         * @type {ProductItem[]}
         */
        this.productItems = cart.products || [];
    }

    get hasItemAtLeastOne() {
        return this.productItems.length > 0;
    }

    get itemsByProduct() {
        const itemMap = {};
        this.productItems.forEach(product => {
            if (itemMap[product.id] === undefined) {
                itemMap[product.id] = {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    quantity: 0
                };
            }
            itemMap[product.id].quantity++;
        });
        return Object.values(itemMap);
    }

    get totalPrice() {
        if (this.productItems.length === 0) {
            return 0;
        }
        return this.productItems.reduce((total, productItem) => {
            return total + productItem.price;
        }, 0);
    }
}