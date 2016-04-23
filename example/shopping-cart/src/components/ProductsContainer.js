import React from 'react';
import ProductItem from './ProductItem';
import ProductsList from './ProductsList';
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
        const products = this.props.products;
        let nodes = products.map(product => {
            return (
                <ProductItemContainer
                    key={product.id}
                    product={product}
                />
            );
        });

        return (
            <ProductsList title="Flux Shop Demo">
                {nodes}
            </ProductsList>
        );
    }
});

export default ProductsListContainer;
