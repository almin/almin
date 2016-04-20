// LICENSE : MIT
"use strict";
const React = require("react");
import {ColorHistoryState} from "../../../js/store/ColorHistoryStore";
import ColorHistory from "../../../js/domain/ColorHistory";
export function ColorHistoryListItem({color}) {
    return <li className="ColorHistoryListItem">
        {color.hexCode}
    </li>
}
export default class ColorHistoryList extends React.Component {
    render() {
        /**
         * @type {ColorHistory}
         */
        const history = this.props.ColorHistoryState.history;
        const items = history.getAllColorList().map((color, index) => {
            return <ColorHistoryListItem key={index} color={color}/>
        });
        return <div className="ColorHistoryList">
            {items}
        </div>
    }
}

ColorHistoryList.propTypes = {
    ColorHistoryState: React.PropTypes.instanceOf(ColorHistoryState).isRequired
};