// LICENSE : MIT
"use strict";
import {StoreGroup} from "almin";
import CartStore from "./CartStore/CartStore";
import ProductStore from "./ProductStore/ProductStore";
// repository
import productRepository from "../infra/ProductRepository";
import cartRepository from "../infra/CartRepository";
export default class AppStore {
    /**
     * @returns {StoreGroup}
     */
    static create() {
        return new StoreGroup([
            new CartStore(cartRepository),
            new ProductStore(productRepository)
        ]);
    }
}