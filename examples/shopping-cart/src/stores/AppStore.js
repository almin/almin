// LICENSE : MIT
"use strict";
import { StoreGroup } from "almin";
import CartStore from "./CartStore/CartStore";
import ProductStore from "./ProductStore/ProductStore";
import CustomerStore from "./CustomerStore/CustomerStore";
// repository
import productRepository from "../infra/ProductRepository";
import cartRepository from "../infra/CartRepository";
import customerRepository from "../infra/CustomerRepository";
export default class AppStore {
    /**
     * @returns {StoreGroup}
     */
    static create() {
        return new StoreGroup({
            CartState: new CartStore({ cartRepository, customerRepository }),
            CustomerState: new CustomerStore(customerRepository),
            ProductState: new ProductStore(productRepository)
        });
    }
}
