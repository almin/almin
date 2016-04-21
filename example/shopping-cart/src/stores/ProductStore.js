import {Store} from 'almin';
import {keys} from '../actions/ActionCreator';
// 在庫
const initialState = {
    products: []
};

function reduceProduct(product, action) {
    switch (action.type) {
        case keys.addToCart:
            return Object.assign({}, product, {
                inventory: product.inventory - 1
            });
        default:
            return product;
    }
}
export function reduceProducts(products = [], action) {
    switch (action.type) {
        case keys.addToCart:
            const {productID} = action;
            return products.map(product => {
                if (product.id !== productID) {
                    return product;
                }
                return reduceProduct(product, action);
            });
        case keys.receiveProducts:
            return action.products;
        default:
            return products
    }
}

export class ProductState {
    constructor({products}) {
        this.products = products || [];
    }

    reduceDomain(products) {
        return new ProductState({products});
    }
}
export default class ProductStore extends Store {
    constructor() {
        super();
        this.statce = new ProductStore({});
    }

    getState(){
        return {
            ProductStore: this.state
        };
    }
}
