import React from 'react';
import ProductItem from './ProductItem.jsx';
import ProductsList from './ProductsList.jsx';
import {addToCart} from "../actions/ActionCreator";
let ProductItemContainer = React.createClass({

    onAddToCartClicked() {
        addToCart(this.props.product);
    },

    render() {
        return (
            <ProductItem
                product={this.props.product}
                onAddToCartClicked={this.onAddToCartClicked}
            />
        );
    }

});

let ProductsListContainer = React.createClass({
    render() {
        const product = this.props.product;
        let nodes = product.products.map(product => {
            return (
                <ProductItemContainer
                    key={product.id}
                    product={product}
                />
            );
        });

        return (
            <ProductsList title="Flux Shop Demo (material-flux)">
                {nodes}
            </ProductsList>
        );
    }
});

export default ProductsListContainer;
