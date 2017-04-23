import React from "react";
import CartContainer from "./CartContainer";
import ProductsContainer from "./ProductsContainer";
import AppLocator from "../AppLocator";
// UseCase
import InitializeCustomerUseCase from "../usecase/Initial/InitializeCustomerUseCase";
import InitializeProductUseCase from "../usecase/Initial/InitializeProductUseCase";
class App extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = AppLocator.context.getState();
    }

    componentDidMount() {
        const context = AppLocator.context;
        // when change store, update component
        const onChangeHandler = (stores) => {
            this.setState(context.getState());
        };
        context.onChange(onChangeHandler);

        context.useCase(InitializeCustomerUseCase.create()).execute().then(() => {
            return context.useCase(InitializeProductUseCase.create()).execute();
        });
    }


    render() {
        const state = AppLocator.context.getState();
        /**
         * @type {CartState}
         */
        const CartState = state.CartState;
        /**
         * @type {ProductState}
         */
        const ProductState = state.ProductState;
        return (
            <div>
                <ProductsContainer products={ProductState.products}/>
                <CartContainer CartState={CartState} total={"1"}/>
            </div>
        );
    }
}

export default App;
