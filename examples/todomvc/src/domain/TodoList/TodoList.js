"use strict";
const uuid = require("uuid");
const assert = require("assert");
import TodoItem from "./TodoItem";
export default class TodoList {
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
    getAllTodoItems() {
        return this._items;
    }

    /**
     * @param id
     * @returns {boolean}
     */
    hasItem(id) {
        return this._items.some(item => {
            return item.id === id;
        });
    }

    /**
     * @param id
     * @returns {TodoItem|undefined}
     */
    getItem(id) {
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
    updateItem(updated) {
        assert(updated.id !== undefined, "should have {id}");
        const item = this.getItem(updated.id);
        const newItem = item.updateItem(updated);
        const index = this._items.indexOf(item);
        assert(index !== -1, "item should contained list");
        this._items = this._items.slice(0, index).concat(newItem, this._items.slice(index + 1));
        return item;
    }

    /**
     * @param {TodoItem} todoItem
     * @return {TodoItem}
     */
    addItem(todoItem) {
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
    toggleComplete(id) {
        const item = this.getItem(id);
        item.completed = !item.completed;
        this.updateItem(item);
        return item;
    }

    /**
     * remove item
     * @param {string} id
     * @returns {TodoItem|undefined}
     */
    removeItem(id) {
        const item = this.getItem(id);
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
