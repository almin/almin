/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import * as React from "react";
import AppLocator from "../AppLocator";
import { ToggleAllTodoItemFactory } from "../usecase/ToggleAllTodoItems";
import { TodoItemComponent } from "./TodoItem.react";
import TodoItem from "../domain/TodoList/TodoItem";

export interface MainSectionProps {
    allTodos: TodoItem[];
    areAllComplete: boolean;
}

export class MainSection extends React.Component<MainSectionProps, {}> {
    /**
     * @return {object}
     */
    render() {
        // This section should be hidden by default
        // and shown when there are todos.
        if (this.props.allTodos.length < 1) {
            return null;
        }

        const allTodos = this.props.allTodos;
        const todos = allTodos.map(todo => {
            return <TodoItemComponent key={todo.id} todo={todo} />;
        });
        return (
            <section id="main">
                <input
                    id="toggle-all"
                    type="checkbox"
                    onChange={this._onToggleCompleteAll}
                    checked={this.props.areAllComplete}
                />
                <label htmlFor="toggle-all">Mark all as complete</label>
                <ul id="todo-list">{todos}</ul>
            </section>
        );
    }

    /**
     * Event handler to mark all TODOs as complete
     */
    _onToggleCompleteAll = () => {
        AppLocator.context.useCase(ToggleAllTodoItemFactory.create()).execute();
    };
}
