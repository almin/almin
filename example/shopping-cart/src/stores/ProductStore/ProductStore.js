import { Store } from "almin";
import ProductState from "./ProductState";
export default class ProductStore extends Store {
    /**
     * @param {ProductRepository} productRepository
     */
    constructor(productRepository) {
        super();
        this.state = new ProductState();
        productRepository.onChange(() => {
            const products = productRepository.findAll();
            const productItems = products.map(product => {
                return product.toProductItem();
            });
            const newState = new ProductState(productItems);
            this.setState(newState);
        });
    }

    getState() {
        return this.state;
    }
}
