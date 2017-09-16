// @flow
"use strict";
import type { DispatcherPayload } from "almin";
import { FilterTodoListUseCase } from "../../usecase/FilterTodoList";
import TodoItem from "../../domain/TodoList/TodoItem";
import TodoList from "../../domain/TodoList/TodoList";
export const FilterTypes = {
    ALL_TODOS: "ALL_TODOS",
    ACTIVE_TODOS: "ACTIVE_TODOS",
    COMPLETED_TODOS: "COMPLETED_TODOS"
};

export default class TodoState {
    items: Array<TodoItem>;
    filterType: string;

    /**
     * @param {TodoItem[]} [items]
     * @param {string} [filterType]
     */
    constructor({ items, filterType }: { items: Array<TodoItem>, filterType: string } = {}) {
        this.items = items || [];
        this.filterType = filterType || FilterTypes.ALL_TODOS;
    }

    /**
     * if all items is completed, return true
     * @returns {boolean}
     */
    get areAllComplete(): boolean {
        return this.items.every(item => {
            return item.completed;
        });
    }

    /**
     * return items in current filterType
     * @returns {Array.<TodoItem>}
     */
    get displayItems(): Array<TodoItem> {
        return this.items.filter(item => {
            switch (this.filterType) {
                case FilterTypes.ACTIVE_TODOS:
                    return !item.completed;
                case FilterTypes.COMPLETED_TODOS:
                    return item.completed;
                default:
                    return true;
            }
        });
    }

    /**
     * @param {TodoList} todoList
     * @returns {TodoState}
     */
    merge(todoList: TodoList): TodoState {
        const items = todoList.getAllTodoItems();
        return new TodoState(
            Object.assign({}, this, {
                items
            })
        );
    }

    /**
     * @param {DispatcherPayload} payload
     * @returns {TodoState}
     */
    reduce(payload: DispatcherPayload): TodoState {
        switch (payload.type) {
            case FilterTodoListUseCase.name:
                return new TodoState(
                    Object.assign(this, {
                        filterType: payload.filterType
                    })
                );
            default:
                return this;
        }
    }
}
