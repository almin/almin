"use strict";
import {FilterTodoListUseCase} from "../../usecase/FilterTodoList";
export const FilterTypes = {
    ALL_TODOS: "ALL_TODOS",
    ACTIVE_TODOS: "ACTIVE_TODOS",
    COMPLETED_TODOS: "COMPLETED_TODOS"
};

export default class TodoState {
    /**
     * @param {TodoItem[]} [items]
     * @param {string} [filterType]
     */
    constructor({items, filterType} = {}) {
        /**
         * @type {TodoItem[]}
         */
        this.items = items || [];
        this.areAllComplete = this.items.every(item => {
            return item.completed;
        });
        this.filterType = filterType || FilterTypes.ALL_TODOS;
        this.displayItems = this.items.filter(item => {
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
    merge(todoList) {
        const items = todoList.getAllTodoItems();
        return new TodoState(Object.assign(this, {
            items
        }));
    }

    /**
     * @param {DispatcherPayload} payload
     * @returns {TodoState}
     */
    reduce(payload) {
        switch (payload.type) {
            case FilterTodoListUseCase.name:
                return new TodoState(Object.assign(this, {
                    filterType: payload.filterType
                }));
            default:
                return this;
        }
    }
}