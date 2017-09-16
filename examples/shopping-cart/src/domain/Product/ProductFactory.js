// MIT © 2017 azu
import Product from "./Product";

("use strict");
export default class ProductFactory {
    /**
     * @param {Object} productJSON products.json data
     * @returns {Product[]}
     */
    static createProductsFromJSON(productJSON) {
        return productJSON.map(productData => {
            return new Product(productData);
        });
    }
}
