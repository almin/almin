// LICENSE : MIT
"use strict";
import { UseCase } from "almin";
import productRepository, { ProductRepository } from "../../infra/ProductRepository";
import { getAllProducts } from "../../utils/WebAPIUtils";
import ProductFactory from "../../domain/Product/ProductFactory";

export default class InitializeProductUseCase extends UseCase {
    /**
     * @returns {InitializeProductUseCase}
     */
    static create() {
        return new this({ productRepository });
    }

    /**
     * @param {ProductRepository} productRepository
     */
    constructor({ productRepository }) {
        super();
        this.productRepository = productRepository;
    }

    /**
     * setup initial data
     * @param {Object} [productsData] from server side
     */
    execute(productsData) {
        // if server-side rendering mode, get data from inline dom data
        // if client-side rendering mode, get data from API access
        const promise = productsData ? Promise.resolve(productsData) : getAllProducts();
        return promise.then(productCatalogData => {
            const products = ProductFactory.createProductsFromJSON(productCatalogData);
            products.forEach(product => {
                this.productRepository.store(product);
            });
        });
    }
}
