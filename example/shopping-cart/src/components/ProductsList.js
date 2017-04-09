"use strict";

const React = require("react");

const PropTypes = require("prop-types");

class ProductsList extends React.Component {
    static propTypes = {
        title: PropTypes.string.isRequired
    };

    render() {
        return (
            <div className="shop-wrap">
                <h2 className="uk-h2">{this.props.title}</h2>
                <div>{this.props.children}</div>
            </div>
        );
    }
}

module.exports = ProductsList;
