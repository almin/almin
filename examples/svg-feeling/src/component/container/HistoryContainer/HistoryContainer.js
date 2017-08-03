// LICENSE : MIT
"use strict";
const React = require("react");
import ColorHistoryList from "../../project/ColorHistoryList/ColorHistoryList";
const shallowCompare = require("react-addons-shallow-compare");
export default class HistoryContainer extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }

    render() {
        return (
            <div className="HistoryContainer">
                <ColorHistoryList colorList={this.props.ColorHistoryState.colorList} />
            </div>
        );
    }
}
