// LICENSE : MIT
"use strict";
import { UseCase } from "almin";
import AnonymousCustomer from "../../domain/Customer/AnonymousCustomer";
import Cart from "../../domain/Cart/Cart";
import customerRepository, { CustomerRepository } from "../../infra/CustomerRepository";
import cartRepository, { CartRepository } from "../../infra/CartRepository";
import AppLocator from "../../AppLocator";

export default class InitializeCustomerUseCase extends UseCase {
    static create() {
        return new this({ customerRepository, cartRepository });
    }

    /**
     * @param {CustomerRepository} customerRepository
     * @param {CartRepository} cartRepository
     */
    constructor({ customerRepository, cartRepository }) {
        super();
        this.customerRepository = customerRepository;
        this.cartRepository = cartRepository;
    }

    execute() {
        const anonymousCustomer = new AnonymousCustomer();
        const newCartForCustomer = new Cart({ customer: anonymousCustomer });
        // Update Global Variable !!
        // Should use repository in real application
        AppLocator.customer = anonymousCustomer;
        // save
        this.customerRepository.store(anonymousCustomer);
        this.cartRepository.store(newCartForCustomer);
    }
}
