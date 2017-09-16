"use strict";
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
export default class GridCell extends React.Component {
    render() {
        const col = `col-${this.props.col}`;
        return <div className={classNames("GridCell", [col], this.props.className)}>{this.props.children}</div>;
    }
}
GridCell.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    col: PropTypes.oneOf([
        "fill",
        "1of12",
        "2of12",
        "3of12",
        "4of12",
        "5of12",
        "6of12",
        "7of12",
        "8of12",
        "9of12",
        "10of12",
        "11of12",
        "12of12",
        "full"
    ]).isRequired
};
