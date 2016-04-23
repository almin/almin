// LICENSE : MIT
"use strict";
import {UseCase} from "almin";
import productRepository, {ProductRepository} from "../../infra/ProductRepository"
import Product from "../../domain/Product/Product";
import {getAllProducts} from "../../utils/WebAPIUtils";
export default class InitializeProductUseCase extends UseCase {
    /**
     * @returns {InitializeProductUseCase}
     */
    static create() {
        return new this({productRepository})
    }

    /**
     * @param {ProductRepository} productRepository
     */
    constructor({productRepository}) {
        super();
        this.productRepository = productRepository;
    }

    /**
     * setup initial data
     */
    execute() {
        return getAllProducts().then(productCatalogData => {
            const products = productCatalogData.map(productData => {
                return new Product(productData);
            });
            products.forEach(product => {
                this.productRepository.store(product);
            });
        });
    }
}