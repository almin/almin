// LICENSE : MIT
"use strict";
import { UseCase } from "almin";
import cartRepository, { CartRepository } from "../infra/CartRepository";
import AppLocator from "../AppLocator";
export default class CheckoutCartUseCase extends UseCase {
    static create() {
        const customer = AppLocator.customer;
        return new this({ customer, cartRepository });
    }

    /**
     * @param {Customer} customer
     * @param {CartRepository} cartRepository
     */
    constructor({ customer, cartRepository }) {
        super();
        this.customer = customer;
        this.cartRepository = cartRepository;
    }

    execute() {
        const cart = this.cartRepository.findLatByCustomer(this.customer);
        if (!cart) {
            return this.throwError(new Error(`Not found cart for the customer: ${this.customer}`));
        }
        return this.customer.checkout(cart).then(() => {
            // save
            this.cartRepository.store(cart);
        });
    }
}
