// @flow
"use strict";
const uuid = require("uuid");
const assert = require("assert");
import type { TodoItemObjectT } from "./TodoItem";
import TodoItem from "./TodoItem";
export default class TodoList {
    id: string;
    _items: Array<TodoItem>;

    constructor() {
        this.id = uuid.v1();
        /**
         * @type {TodoItem[]}
         * @private
         */
        this._items = [];
    }

    /**
     * @returns {TodoItem[]}
     */
    getAllTodoItems(): Array<TodoItem> {
        return this._items;
    }

    /**
     * @param id
     * @returns {boolean}
     */
    hasItem(id: string): boolean {
        return this._items.some(item => {
            return item.id === id;
        });
    }

    /**
     * @param id
     * @returns {TodoItem|undefined}
     */
    getItem(id: string): ?TodoItem {
        assert(id, "need id");
        const items = this._items.filter(item => {
            return item.id === id;
        });
        if (items.length > 0) {
            return items[0];
        }
    }

    /**
     * update item with updated object.
     * @param {Object} updated
     * @returns {TodoItem}
     */
    updateItem(updated: $Shape<TodoItemObjectT>): ?TodoItem {
        assert(updated.id !== undefined, "should have {id}");
        const item = this.getItem(updated.id);
        if (item != null) {
            const newItem = item.updateItem(updated);
            const index = this._items.indexOf(item);
            this._items = this._items.slice(0, index).concat(newItem, this._items.slice(index + 1));
            return item;
        }
    }

    /**
     * @param {TodoItem} todoItem
     * @return {TodoItem}
     */
    addItem<T: TodoItem>(todoItem: T): T {
        this._items = this._items.concat(todoItem);
        return todoItem;
    }

    /**
     * toggle status of all items
     */
    toggleCompleteAll() {
        this.getAllTodoItems().forEach(item => {
            return this.toggleComplete(item.id);
        });
    }

    /**
     * toggle status of the item
     * @param {string} id
     * @returns {TodoItem|undefined}
     */
    toggleComplete(id: string): ?TodoItem {
        const item = this.getItem(id);
        if (item != null) {
            item.completed = !item.completed;
            this.updateItem((item: TodoItemObjectT));
            return item;
        }
    }

    /**
     * remove item
     * @param {string} id
     * @returns {TodoItem|undefined}
     */
    removeItem(id: string): ?TodoItem {
        const item = this.getItem(id);
        if (item != null) {
            const index = this._items.indexOf(item);
            this._items = this._items.slice(0, index).concat(this._items.slice(index + 1));
            return item;
        }
    }

    /**
     * remove all completed items
     */
    removeAllCompletedItems() {
        this.getAllTodoItems()
            .filter(item => item.completed)
            .forEach(item => {
                return this.removeItem(item.id);
            });
    }
}
