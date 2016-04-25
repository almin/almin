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
import {UpdateTodoItemTitleFactory} from "../js/usecase/UpdateTodoItemTitle";
import {ToggleCompleteTodoItemFactory} from "../js/usecase/ToggleCompleteTodoItem";
import {RemoveTodoItemFactory} from "../js/usecase/RemoveTodoItem";
var TodoTextInput = require('./TodoTextInput.react');

var classNames = require('classnames');

var TodoItem = React.createClass({

    propTypes: {
        todo: ReactPropTypes.object.isRequired
    },

    getInitialState: function () {
        return {
            isEditing: false,
            completed: false
        };
    },

    componentWillReceiveProps(nextPros, nextState){
        const todo = nextPros.todo;
        this.setState({
            completed: todo.completed
        })
    },
    /**
     * @return {object}
     */
    render: function () {
        var todo = this.props.todo;

        var input;
        if (this.state.isEditing) {
            input =
                <TodoTextInput
                    className="edit"
                    onSave={this._onSave}
                    value={todo.title}
                />;
        }

        // List items should get the class 'editing' when editing
        // and 'completed' when marked as completed.
        // Note that 'completed' is a classification while 'complete' is a state.
        // This differentiation between classification and state becomes important
        // in the naming of view actions toggleComplete() vs. destroyCompleted().
        return (
            <li
                className={classNames({
          'completed': todo.completed,
          'editing': this.state.isEditing
        })}
                key={todo.id}>
                <div className="view">
                    <input
                        className="toggle"
                        type="checkbox"
                        checked={this.state.completed}
                        onChange={this._onToggleComplete}
                    />
                    <label onDoubleClick={this._onDoubleClick}>
                        {todo.title}
                    </label>
                    <button className="destroy" onClick={this._onDestroyClick}/>
                </div>
                {input}
            </li>
        );
    },

    _onToggleComplete: function () {
        AppLocator.context.useCase(ToggleCompleteTodoItemFactory.create()).execute(this.props.todo.id);
    },

    _onDoubleClick: function () {
        this.setState({isEditing: true});
    },

    /**
     * Event handler called within TodoTextInput.
     * Defining this here allows TodoTextInput to be used in multiple places
     * in different ways.
     * @param  {string} title
     */
    _onSave: function (title) {
        AppLocator.context.useCase(UpdateTodoItemTitleFactory.create()).execute({
            id: this.props.todo.id,
            title
        });
        this.setState({isEditing: false});
    },

    _onDestroyClick: function () {
        AppLocator.context.useCase(RemoveTodoItemFactory.create()).execute(this.props.todo.id);
    }

});

module.exports = TodoItem;
