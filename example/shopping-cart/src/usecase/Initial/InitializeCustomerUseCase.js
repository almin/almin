// LICENSE : MIT
"use strict";
import {UseCase} from "almin";
import AppLocator from "../../AppLocator";
import AnonymousCustomer from "../../domain/Customer/AnonymousCustomer";
import Cart from "../../domain/Cart/Cart";
import customerRepository, {CustomerRepository} from "../../infra/CustomerRepository";
import cartRepository, {CartRepository} from "../../infra/CartRepository";

// Add log
cartRepository.onChange(domain => {
    AppLocator.alminLogger.addLog(["Change CartRepository", domain]);
});
customerRepository.onChange(domain => {
    AppLocator.alminLogger.addLog(["Change CustomerRepository", domain]);
});
export default class InitializeCustomerUseCase extends UseCase {
    static create() {
        return new this({customerRepository, cartRepository})
    }

    /**
     * @param {CustomerRepository} customerRepository
     * @param {CartRepository} cartRepository
     */
    constructor({customerRepository, cartRepository}) {
        super();
        this.customerRepository = customerRepository;
        this.cartRepository = cartRepository;
    }

    execute() {
        const anonymousCustomer = new AnonymousCustomer();
        const newCartForCustomer = new Cart({customer: anonymousCustomer});
        // save
        this.customerRepository.store(anonymousCustomer);
        this.cartRepository.store(newCartForCustomer);
    }
}