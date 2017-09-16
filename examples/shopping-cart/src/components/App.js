import React from "react";
import CartContainer from "./CartContainer";
import ProductsContainer from "./ProductsContainer";

class App extends React.Component {
    render() {
        /**
         * @type {CartState}
         */
        const CartState = this.props.CartState;
        /**
         * @type {ProductState}
         */
        const ProductState = this.props.ProductState;
        return (
            <div>
                <ProductsContainer products={ProductState.products} />
                <CartContainer CartState={CartState} total={"1"} />
            </div>
        );
    }
}

export default App;
