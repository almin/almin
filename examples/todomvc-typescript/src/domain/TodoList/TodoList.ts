"use strict";
const uuid = require("uuid");
import * as assert from "assert";
import TodoItem, { TodoItemArgs } from "./TodoItem";
export default class TodoList {
    id: string;
    private _items: TodoItem[];

    constructor() {
        this.id = uuid.v1();
        this._items = [];
    }

    getAllTodoItems() {
        return this._items;
    }

    hasItem(id: string) {
        return this._items.some(item => {
            return item.id === id;
        });
    }

    getItem(id: string): TodoItem | undefined {
        const items = this._items.filter(item => {
            return item.id === id;
        });
        if (items.length > 0) {
            return items[0];
        }
        return undefined;
    }

    /**
     * update item with updated object.
     * @param {Object} updated
     * @returns {TodoItem}
     */
    updateItem(updated: Partial<TodoItemArgs>) {
        if (updated.id === undefined) {
            throw new Error("should have {id}");
        }
        const item = this.getItem(updated.id);
        if (!item) {
            return;
        }
        const newItem = item.updateItem(updated);
        const index = this._items.indexOf(item);
        assert.ok(index !== -1, "item should contained list");
        this._items = this._items.slice(0, index).concat(newItem, this._items.slice(index + 1));
        return item;
    }

    /**
     * @param {TodoItem} todoItem
     * @return {TodoItem}
     */
    addItem(todoItem: TodoItem) {
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
    toggleComplete(id: string) {
        const item = this.getItem(id);
        if (!item) {
            return;
        }
        item.completed = !item.completed;
        this.updateItem(item);
        return item;
    }

    /**
     * remove item
     * @param {string} id
     * @returns {TodoItem|undefined}
     */
    removeItem(id: string) {
        const item = this.getItem(id);
        if (!item) {
            return;
        }
        const index = this._items.indexOf(item);
        this._items = this._items.slice(0, index).concat(this._items.slice(index + 1));
        return item;
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
