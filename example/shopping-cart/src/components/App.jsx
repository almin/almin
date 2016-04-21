import React from 'react';
import CartContainer from './CartContainer.jsx';
import ProductsContainer from './ProductsContainer.jsx';
import dispatcher from "../dispatcher";
import AppState from "../AppState";
import {getAllProducts} from "../actions/ActionCreator";
const appState = new AppState(dispatcher);
class App extends React.Component {
    componentDidMount() {
        this.offOnCange = appState.onChange(() => {
            this.forceUpdate()
        });
        getAllProducts();
    }

    componentWillUnmount() {
        this.offOnCange();
    }

    render() {
        const state = appState.getState();
        return (
            <div>
                <ProductsContainer product={state.product}/>
                <CartContainer products={appState.getCartProducts()} total={appState.getTotal()}/>
            </div>
        );
    }
}

export default App;
