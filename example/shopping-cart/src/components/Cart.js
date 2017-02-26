"use strict";

const React = require("react");
const ProductHeader = React.createClass({
    render () {
        return <div>{this.props.children}</div>;
    }
});

const Cart = React.createClass({
    propTypes: {
        products: React.PropTypes.arrayOf(React.PropTypes.shape({
            id: React.PropTypes.number.isRequired,
            title: React.PropTypes.string.isRequired,
            price: React.PropTypes.number.isRequired,
            quantity: React.PropTypes.number.isRequired
        })).isRequired,
        total: React.PropTypes.string.isRequired,
        onCheckoutClicked: React.PropTypes.func.isRequired
    },

    render () {
        const products = this.props.products;

        const hasProducts = products.length > 0;
        const nodes = !hasProducts ?
                      <div>Please add some products to cart.</div> :
                      products.map(function (p) {
                          return <ProductHeader key={p.id}>{p.title} - &euro;{p.price} x {p.quantity}</ProductHeader>;
                      });

        return (
            <div className="cart uk-panel uk-panel-box uk-panel-box-primary">
                <div className="uk-badge uk-margin-bottom">Your Cart</div>
                <div className="uk-margin-small-bottom">{nodes}</div>
                <div className="uk-margin-small-bottom">Total: &euro;{this.props.total}</div>
                <button className="uk-button uk-button-large uk-button-success uk-align-right"
                        onClick={this.props.onCheckoutClicked}
                        disabled={hasProducts ? "" : "disabled"}>
                    Checkout
                </button>
            </div>
        );
    }
});

module.exports = Cart;
