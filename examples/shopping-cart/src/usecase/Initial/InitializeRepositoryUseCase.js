// MIT © 2017 azu
"use strict";
import { UseCase } from "almin";
import customerRepository from "../../infra/CustomerRepository";
import cartRepository from "../../infra/CartRepository";
import productRepository from "../../infra/ProductRepository";
import AppLocator from "../../AppLocator";

function addToAlminLogger(message) {
    if (AppLocator.alminLogger) {
        AppLocator.alminLogger.addLog(message);
    }
}

export default class InitializeRepositoryUseCase extends UseCase {
    static create() {
        return new this([cartRepository, customerRepository, productRepository]);
    }

    constructor(repositories) {
        super();
        this.repositories = repositories;
    }

    execute() {
        // clear each repository
        this.repositories.forEach(repository => {
            repository.clear();
        });
        // observe changes
        this.repositories.forEach(repository => {
            cartRepository.onChange(domain => {
                addToAlminLogger([`💾 Repository:${repository.constructor.name}`, domain]);
            });
        });
    }
}
