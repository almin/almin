"use strict";
import TodoItem from "../../domain/TodoList/TodoItem";
import TodoList from "../../domain/TodoList/TodoList";
export enum FilterTypes {
    ALL_TODOS = "ALL_TODOS",
    ACTIVE_TODOS = "ACTIVE_TODOS",
    COMPLETED_TODOS = "COMPLETED_TODOS"
}

export interface TodoStateArgs {
    items: TodoItem[];
    filterType: FilterTypes;
}
export default class TodoState {
    items: TodoItem[];
    filterType: FilterTypes;

    constructor(args: TodoStateArgs) {
        this.items = args.items;
        this.filterType = args.filterType;
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
     * Merge todoList and return new state
     */
    merge(todoList: TodoList) {
        const items = todoList.getAllTodoItems();
        return new TodoState(
            Object.assign({
                ...(this as TodoStateArgs),
                items
            })
        );
    }

    reduce(payload: { type: "FilterTodoListUseCase"; filterType: FilterTypes }) {
        switch (payload.type) {
            case "FilterTodoListUseCase":
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
