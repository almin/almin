import { Store } from "almin";
import ProductState from "./ProductState";

export default class ProductStore extends Store {
    /**
     * @param {ProductRepository} productRepository
     */
    constructor(productRepository) {
        super();
        this.productRepository = productRepository;
        this.state = new ProductState();
    }

    receivePayload(payload) {
        const products = this.productRepository.findAll();
        const productItems = products.map(product => {
            return product.toProductItem();
        });
        const newState = new ProductState(productItems);
        this.setState(newState);
    }

    getState() {
        return this.state;
    }
}
