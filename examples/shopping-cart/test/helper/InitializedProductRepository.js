// LICENSE : MIT
"use strict";
import Product from "../../src/domain/Product/Product";
const productCatalogData = require("./products.json");
import { ProductRepository } from "../../src/infra/ProductRepository";
export default class InitializedProductRepository {
    /**
     * @returns {{products: Array, productRepository: ProductRepository}}
     */
    static create() {
        const productRepository = new ProductRepository();
        const products = productCatalogData.map(productData => {
            return new Product(productData);
        });
        products.forEach(product => {
            productRepository.store(product);
        });
        return {
            products,
            productRepository
        };
    }
}
