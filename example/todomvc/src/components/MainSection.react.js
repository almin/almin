/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var React = require('react');
var ReactPropTypes = React.PropTypes;
import AppLocator from "../AppLocator";
import {ToggleCompleteAllTodoItemFactory} from "../js/usecase/ToggleCompleteAll";
var TodoItem = require('./TodoItem.react');

var MainSection = React.createClass({

    propTypes: {
        allTodos: ReactPropTypes.array.isRequired,
        areAllComplete: ReactPropTypes.bool.isRequired
    },

    /**
     * @return {object}
     */
    render: function () {
        // This section should be hidden by default
        // and shown when there are todos.
        if (this.props.allTodos.length < 1) {
            return null;
        }

        var allTodos = this.props.allTodos;
        var todos = allTodos.map(todo => {
            return <TodoItem key={todo.id} todo={todo}/>;
        });

        return (
            <section id="main">
                <input
                    id="toggle-all"
                    type="checkbox"
                    onChange={this._onToggleCompleteAll}
                    checked={this.props.areAllComplete ? 'checked' : ''}
                />
                <label htmlFor="toggle-all">Mark all as complete</label>
                <ul id="todo-list">{todos}</ul>
            </section>
        );
    },

    /**
     * Event handler to mark all TODOs as complete
     */
    _onToggleCompleteAll: function () {
        AppLocator.context.useCase(ToggleCompleteAllTodoItemFactory.create()).execute();
    }

});

module.exports = MainSection;
