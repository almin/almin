import {checkoutProducts, getAllProducts as uGetAllProducts} from '../utils/WebAPIUtils';
import dispatcher from "../dispatcher";
export var keys = {
    'getAllProducts': 'getAllProducts',
    'receiveProducts': 'receiveProducts',
    'addToCart': 'addToCart',
    'beginCheckout': 'beginCheckout',
    'finishCheckout': 'finishCheckout'
};
export function getAllProducts() {
    return uGetAllProducts().then((products) => {
        const allProducts = receiveProducts(products);
        dispatcher.dispatch({
            type: keys.getAllProducts,
            products: allProducts
        });
    });
}

export function receiveProducts(products) {
    dispatcher.dispatch({
        type: keys.receiveProducts,
        products
    });
}

export function addToCart(product) {
    dispatcher.dispatch({
        type: keys.addToCart,
        productID: product.id
    });
}

export function cartCheckout(products) {
    beginCheckout();

    checkoutProducts(products).then((products)=> {
        finishCheckout(products);
    });
}

export function beginCheckout() {
    dispatcher.dispatch({
        type: keys.beginCheckout,
        isChecking: true
    });
}

export function finishCheckout(products) {
    dispatcher.dispatch({
        type: keys.finishCheckout,
        products
    });
}

