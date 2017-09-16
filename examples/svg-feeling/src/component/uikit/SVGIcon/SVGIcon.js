// LICENSE : MIT
"use strict";
const React = require("react");
const PropTypes = require("prop-types");
export default class SVGIcon extends React.Component {
    render() {
        const name = this.props.name;
        const href = `resources/svg/icons.svg#${name}`;
        return (
            <svg className="SVGIcon" aria-hidden="true" {...this.props}>
                <use xlinkHref={href} />
            </svg>
        );
    }
}
SVGIcon.propTypes = {
    name: PropTypes.oneOf(["play", "play-no-space", "cross", "check", "star", "heart1", "heart2", "hearts", "twitter"])
        .isRequired
};
