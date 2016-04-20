"use strict";
import React from "react";
import classNames from "classnames";

/*
 @example
 <button>
 <Icon> text
 </button>

 と書くとアイコンとテキストが横並びになる要素
 */
export default class Image extends React.Component {
    render() {
        return (
            // アイコンなのでaltは空にする
            <img alt={this.props.alt || ""} {...this.props}
                 className={classNames("Image", this.props.className)}
            />
        );
    }
}
Image.propTypes = {
    src: React.PropTypes.string.isRequired,
    alt: React.PropTypes.string
};