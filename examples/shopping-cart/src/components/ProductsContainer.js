import React from "react";
import ProductItem from "./ProductItem";
import ProductsList from "./ProductsList";
import AddItemToCartUseCase from "../usecase/AddItemToCartUseCase";
import AppLocator from "../AppLocator";

class ProductItemContainer extends React.Component {
    onAddToCartClicked = () => {
        const useCase = AddItemToCartUseCase.create();
        AppLocator.context.useCase(useCase).execute(this.props.product.id);
    };

    render() {
        return <ProductItem product={this.props.product} onAddToCartClicked={this.onAddToCartClicked} />;
    }
}

class ProductsListContainer extends React.Component {
    render() {
        const products = this.props.products;
        const nodes = products.map(product => {
            return <ProductItemContainer key={product.id} product={product} />;
        });

        return <ProductsList title="Flux Shop Demo">{nodes}</ProductsList>;
    }
}

export default ProductsListContainer;
