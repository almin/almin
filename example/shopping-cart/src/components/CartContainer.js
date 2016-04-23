import React from 'react';
import Cart from './Cart';
let CartContainer = React.createClass({
    onCheckoutClicked() {
        if (!this.props.products.length) {
            return;
        }
        cartCheckout(this.props.products);
    },

    render() {
        const {CartState} = this.props;
        return (
            <Cart
                products={CartState.itemsByProduct}
                total={String(CartState.totalPrice)}
                onCheckoutClicked={this.onCheckoutClicked}
            />
        );
    }
});

export default CartContainer;
