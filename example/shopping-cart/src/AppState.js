// LICENSE : MIT
"use strict";
import {StoreGroup} from "reduce-flux";
import CartStore from "./stores/CartStore";
import ProductStore from "./stores/ProductStore";

// store instance
const cartStore = new CartStore();
const productStore = new ProductStore();
export default class AppState extends StoreGroup {

    getStores() {
        return [cartStore, productStore];
    };

    getTotal() {
        return cartStore.getAddedIds().reduce((total, id) => {
            var product = productStore.getProduct(id);
            console.log(product);
            return total + product.price * cartStore.getQuantity(id)
        }, 0).toFixed(2);
    }

    getCartProducts() {
        return cartStore.getAddedIds().map(id => {
            return Object.assign({}, productStore.getProduct(id), {
                quantity: cartStore.getQuantity(id)
            })
        });
    }

    getState() {
        return {
            cart: cartStore.getState(),
            product: productStore.getState()
        }
    };
}