import React from "react";
import Cart from "./Cart";
import AppLocator from "../AppLocator";
import CheckoutCartUseCase from "../usecase/CheckoutCartUseCase";

class CartContainer extends React.Component {
    onCheckoutClicked = () => {
        const { CartState } = this.props;
        if (!CartState.hasItemAtLeastOne) {
            return;
        }
        AppLocator.context.useCase(CheckoutCartUseCase.create()).execute();
    };

    render() {
        const { CartState } = this.props;
        return (
            <Cart
                products={CartState.itemsByProduct}
                total={String(CartState.totalPrice)}
                onCheckoutClicked={this.onCheckoutClicked}
            />
        );
    }
}

export default CartContainer;
