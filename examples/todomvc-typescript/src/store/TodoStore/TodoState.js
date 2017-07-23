"use strict";
import { FilterTodoListUseCase } from "../../usecase/FilterTodoList";
export const FilterTypes = {
    ALL_TODOS: "ALL_TODOS",
    ACTIVE_TODOS: "ACTIVE_TODOS",
    COMPLETED_TODOS: "COMPLETED_TODOS"
};

export default class TodoState {
    /**
     * @param {TodoItem[]} items
     * @param {string} filterType
     */
    constructor({ items, filterType }) {
        this.items = items;
        this.filterType = filterType;
    }

    /**
     * if all items is completed, return true
     * @returns {boolean}
     */
    get areAllComplete() {
        return this.items.every(item => {
            return item.completed;
        });
    }

    /**
     * return items in current filterType
     * @returns {Array.<TodoItem>}
     */
    get displayItems() {
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
    merge(todoList) {
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
    reduce(payload) {
        switch (payload.type) {
            case FilterTodoListUseCase.name:
                return new TodoState(
                    Object.assign({}, this, {
                        filterType: payload.filterType
                    })
                );
            default:
                return this;
        }
    }
}
