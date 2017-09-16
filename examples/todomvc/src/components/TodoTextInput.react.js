/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const React = require("react");
const PropTypes = require("prop-types");
const ReactPropTypes = PropTypes;
const ENTER_KEY_CODE = 13;

class TodoTextInput extends React.Component {
    static propTypes = {
        className: ReactPropTypes.string,
        id: ReactPropTypes.string,
        placeholder: ReactPropTypes.string,
        onSave: ReactPropTypes.func.isRequired,
        value: ReactPropTypes.string
    };

    state = {
        value: this.props.value || ""
    };

    /**
     * @return {object}
     */
    render() /*object*/ {
        return (
            <input
                className={this.props.className}
                id={this.props.id}
                placeholder={this.props.placeholder}
                onBlur={this._save}
                onChange={this._onChange}
                onKeyDown={this._onKeyDown}
                value={this.state.value}
                autoFocus={true}
            />
        );
    }

    /**
     * Invokes the callback passed in as onSave, allowing this component to be
     * used in different ways.
     */
    _save = () => {
        this.props.onSave(this.state.value);
        this.setState({
            value: ""
        });
    };

    /**
     * @param {object} event
     */
    _onChange = (/*object*/ event) => {
        this.setState({
            value: event.target.value
        });
    };

    /**
     * @param  {object} event
     */
    _onKeyDown = event => {
        if (event.keyCode === ENTER_KEY_CODE) {
            this._save();
        }
    };
}

export default TodoTextInput;
