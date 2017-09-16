// LICENSE : MIT
"use strict";
import { UseCase } from "almin";
import productRepository, { ProductRepository } from "../infra/ProductRepository";
import cartRepository, { CartRepository } from "../infra/CartRepository";
import AppLocator from "../AppLocator";
export default class AddItemToCartUseCase extends UseCase {
    static create() {
        const customer = AppLocator.customer;
        return new this({ customer, productRepository, cartRepository });
    }

    /**
     * @param {Customer} customer
     * @param {CartRepository} cartRepository
     * @param {ProductRepository} productRepository
     */
    constructor({ customer, cartRepository, productRepository }) {
        super();
        this.customer = customer;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    execute(itemID) {
        const product = this.productRepository.findById(itemID);
        const cart = this.cartRepository.findLatByCustomer(this.customer);
        if (!product) {
            return this.throwError(new Error(`Not found in Product catalog. ItemID: ${itemID}`));
        }
        if (!cart) {
            return this.throwError(new Error(`Not found cart for the customer: ${this.customer}`));
        }
        // add item
        const productItem = product.pickupProductItem();
        cart.addItem(productItem);
        // save
        this.cartRepository.store(cart);
        this.productRepository.store(product);
    }
}
