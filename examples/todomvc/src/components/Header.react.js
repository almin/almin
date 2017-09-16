/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const React = require("react");
import AppLocator from "../AppLocator";
import { AddTodoItemFactory } from "../usecase/AddTodoItem";
import TodoTextInput from "./TodoTextInput.react";

class Header extends React.Component {
    /**
     * @return {object}
     */
    render() {
        return (
            <header id="header">
                <h1>todos</h1>
                <TodoTextInput id="new-todo" placeholder="What needs to be done?" onSave={this._onSave} />
            </header>
        );
    }

    /**
     * Event handler called within TodoTextInput.
     * Defining this here allows TodoTextInput to be used in multiple places
     * in different ways.
     * @param {string} text
     */
    _onSave = text => {
        if (text.trim()) {
            AppLocator.context.useCase(AddTodoItemFactory.create()).execute(text);
        }
    };
}

export default Header;
