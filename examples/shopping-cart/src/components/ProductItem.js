"use strict";

const React = require("react");
const PropTypes = require("prop-types");
import ProductItem from "../domain/value/ProductItem";

class ProductItemComponent extends React.Component {
    static propTypes = {
        product: PropTypes.instanceOf(ProductItem).isRequired,
        onAddToCartClicked: PropTypes.func.isRequired
    };

    render() {
        const product = this.props.product;

        return (
            <div className="uk-panel uk-panel-box uk-margin-bottom">
                <img className="uk-thumbnail uk-thumbnail-mini uk-align-left" src={product.image} />
                <h4 className="uk-h4">
                    {product.title} - &euro;{product.price}
                </h4>
                <button
                    className="uk-button uk-button-small uk-button-primary"
                    onClick={this.props.onAddToCartClicked}
                    disabled={product.inventory > 0 ? "" : "disabled"}
                >
                    {product.inventory > 0 ? "Add to cart" : "Sold Out"}
                </button>
            </div>
        );
    }
}

module.exports = ProductItemComponent;
