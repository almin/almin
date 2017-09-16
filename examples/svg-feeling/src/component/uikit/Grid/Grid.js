"use strict";
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import suitClassNames from "suitcss-classnames";
import GridCell from "./GridCell";
/**
 Usage

 <Grid>
 <GridCell col="6of12">
 contents
 </GridCell>
 <GridCell col="6nof12">>
 contents
 </GridCell>
 </Grid>
 */
export { GridCell };
export class Grid extends React.Component {
    render() {
        // <Component>--modifier
        const names = suitClassNames({
            component: "Grid",
            modifiers: {
                [`align${this.props.align}`]: this.props.align,
                [`verticalAlign${this.props.verticalAlign}`]: this.props.verticalAlign,
                gutter: this.props.gutter
            }
        });
        return <div className={classNames(names, this.props.className)}>{this.props.children}</div>;
    }
}

Grid.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    // e.g.) alignLeft
    align: PropTypes.oneOf(["Left", "Center", "Right"]),
    // e.g.) verticalAlignTop
    verticalAlign: PropTypes.oneOf(["Top", "Middle", "Bottom"]),
    gutter: PropTypes.oneOf(["4", "8", "12", "16", "20", "24", "40"])
};
