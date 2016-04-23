import React from 'react';
import CartContainer from './CartContainer';
import ProductsContainer from './ProductsContainer';
import AppContextLocator from "../AppContextLocator";
// UseCase
import InitializeCustomerUseCase from "../usecase/Initial/InitializeCustomerUseCase";
import InitializeProductUseCase from "../usecase/Initial/InitializeProductUseCase";
class App extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = AppContextLocator.context.getState();
    }

    componentDidMount() {
        const context = AppContextLocator.context;
        // when change store, update component
        const onChangeHandler = () => {
            return requestAnimationFrame(() => {
                this.setState(context.getState());
            })
        };
        context.onChange(onChangeHandler);

        context.useCase(InitializeCustomerUseCase.create()).execute();
        context.useCase(InitializeProductUseCase.create()).execute();
    }


    render() {
        const state = AppContextLocator.context.getState();
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
                <CartContainer products={CartState.products} total={"1"}/>
            </div>
        );
    }
}

export default App;
