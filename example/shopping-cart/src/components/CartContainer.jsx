import React from 'react';
import Cart from './Cart.jsx';
import {cartCheckout} from "../actions/ActionCreator"
let CartContainer = React.createClass({
    onCheckoutClicked() {
        if (!this.props.products.length) {
            return;
        }
        cartCheckout(this.props.products);
    },

    render() {
        const {products, total} = this.props;
        return (
            <Cart
                products={products}
                total={total}
                onCheckoutClicked={this.onCheckoutClicked}
            />
        );
    }
});

export default CartContainer;
