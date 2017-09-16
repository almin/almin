"use strict";
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
/*
 @example
 <Link href="http://example.com/">text</Link>

 と書くとリンクになるコンポーネント
 */
export default class Link extends React.Component {
    render() {
        return <a {...this.props} className={classNames("Link", this.props.className)} />;
    }
}
Link.propTypes = {
    href: PropTypes.string.isRequired
};
