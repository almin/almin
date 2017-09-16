// LICENSE : MIT
"use strict";
const React = require("react");
const PropTypes = require("prop-types");
import SVGIcon from "../../uikit/SVGIcon/SVGIcon";
import Color from "../../../js/domain/value/Color";
export default class IconPalette extends React.Component {
    render() {
        /**
         * @type {Color}
         */
        const color = this.props.color;
        const fillColor = {
            color: color.hexCode,
            fill: color.hexCode
        };
        return (
            <div className="IconPalette">
                <SVGIcon name="check" style={fillColor} />
                <SVGIcon name="hearts" style={fillColor} />
                <SVGIcon name="play" style={fillColor} />
                <span className="IconPalette-hexCode">{color.hexCode}</span>
            </div>
        );
    }
}
IconPalette.propTypes = {
    color: PropTypes.instanceOf(Color).isRequired
};
