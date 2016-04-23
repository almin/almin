// LICENSE : MIT
"use strict";
import {UseCase} from "almin";
import AnonymousCustomer from "../../domain/Customer/AnonymousCustomer";
import customerRepository, {CustomerRepository} from "../../infra/CustomerRepository";
export default class InitializeCustomerUseCase extends UseCase {
    static create() {
        return new this({customerRepository})
    }

    /**
     * @param {CustomerRepository} customerRepository
     */
    constructor({customerRepository}) {
        super();
        this.customerRepository = customerRepository;
    }

    execute() {
        const anonymousCustomer = new AnonymousCustomer();
        this.customerRepository.store(anonymousCustomer);
    }
}