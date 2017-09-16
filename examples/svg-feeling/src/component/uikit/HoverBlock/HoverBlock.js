import React from "react";
const suitClassNames = require("suitcss-classnames");
const classNames = require("classnames");
/**
 * :hoverのようにmouseEnter/mouseLeaveしたら処理を行うボタン
 */
export default class HoverBlock extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hover: false };
    }

    render() {
        const mouseEnter = event => {
            if (!this.state.hover && typeof this.props.onMouseEnter === "function") {
                this.props.onMouseEnter(event);
            }
            this.setState({ hover: true });
        };
        const mouseLeave = event => {
            if (this.state.hover && typeof this.props.onMouseLeave === "function") {
                this.props.onMouseLeave(event);
            }
            this.setState({ hover: false });
        };
        const className = suitClassNames({
            component: "HoverBlock",
            states: {
                "is-hovering": this.state.hover
            }
        });
        return (
            <div
                className={classNames(className, this.props.className)}
                onMouseEnter={mouseEnter}
                onMouseLeave={mouseLeave}
            >
                {this.props.children}
            </div>
        );
    }
}

HoverBlock.propTypes = {
    children: PropTypes.node.isRequired,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func
};
