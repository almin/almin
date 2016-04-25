/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const React = require('react');
const ReactPropTypes = React.PropTypes;
const classNames = require("classnames");
import AppLocator from "../AppLocator";
import {RemoveTodoItemFactory} from "../js/usecase/RemoveAllCompletedItems";
import {FilterTodoListFactory} from "../js/usecase/FilterTodoList";
import {FilterTypes} from "../js/store/TodoStore/TodoState";
const Footer = React.createClass({
    propTypes: {
        allTodos: ReactPropTypes.array.isRequired
    },

    /**
     * @return {object}
     */
    render: function () {
        const allTodos = this.props.allTodos;
        const filterType = this.props.filterType;
        const total = allTodos.length;
        if (total === 0) {
            return null;
        }

        const completed = allTodos.reduce((total, item) => {
            return total + (item.completed ? 1 : 0);
        }, 0);

        const itemsLeft = total - completed;
        let itemsLeftPhrase = itemsLeft === 1 ? ' item ' : ' items ';
        itemsLeftPhrase += 'left';

        // Undefined and thus not rendered if no completed items are left.
        let clearCompletedButton;
        if (completed) {
            clearCompletedButton =
                <button
                    id="clear-completed"
                    onClick={this._onClearCompletedClick}>
                    Clear completed ({completed})
                </button>;
        }

        const filterByType = (type) => {
            return event => {
                event.preventDefault();
                AppLocator.context.useCase(FilterTodoListFactory.create()).execute(type);
            }
        };
        return (
            <footer id="footer">
                <span id="todo-count">
                  <strong>
                    {itemsLeft}
                  </strong>
                    {itemsLeftPhrase}
                </span>
                <ul id="filters">
                    <li>
                        <a
                            href="#/"
                            onClick={filterByType(FilterTypes.ALL_TODOS)}
                            className={classNames({selected: filterType === FilterTypes.ALL_TODOS})}>
                            All
                        </a>
                    </li>
                    {' '}
                    <li>
                        <a
                            href="#/active"
                            onClick={filterByType(FilterTypes.ACTIVE_TODOS)}
                            className={classNames({selected: filterType === FilterTypes.ACTIVE_TODOS})}>
                            Active
                        </a>
                    </li>
                    {' '}
                    <li>
                        <a
                            href="#/completed"
                            onClick={filterByType(FilterTypes.COMPLETED_TODOS)}
                            className={classNames({selected: filterType === FilterTypes.COMPLETED_TODOS})}>
                            Completed
                        </a>
                    </li>
                </ul>
                {clearCompletedButton}
            </footer>
        );
    },

    /**
     * Event handler to delete all completed TODOs
     */
    _onClearCompletedClick: function () {
        AppLocator.context.useCase(RemoveTodoItemFactory.create()).execute();
    }

});

module.exports = Footer;
