import React from "react";
import ProductItem from "./ProductItem";
import ProductsList from "./ProductsList";
import AddItemToCartUseCase from "../usecase/AddItemToCartUseCase";
import AppLocator from "../AppLocator";
const ProductItemContainer = React.createClass({
    onAddToCartClicked() {
        const useCase = AddItemToCartUseCase.create();
        AppLocator.context.useCase(useCase).execute(this.props.product.id);
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

const ProductsListContainer = React.createClass({
    render() {
        const products = this.props.products;
        const nodes = products.map(product => {
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
