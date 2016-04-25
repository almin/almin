// LICENSE : MIT
"use strict";
const uuid = require('uuid');
import TodoItem from "./TodoItem";
export default class TodoList {
    constructor() {
        this.id = uuid.v1();
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
        const items = this._items.filter(item => {
            return item.id === id;
        });
        if (items.length > 0) {
            return items[0];
        }
    }

    /**
     * @param {Object} updated
     * @returns {TodoItem}
     */
    updateItem(updated) {
        assert(updated.id !== undefined, "should have {id}");
        const item = this.getItem(updated.id);
        const newItem = item.updateItem(updated);
        this._items[this._items.indexOf(item)] = newItem;
        return this;
    }

    /**
     * @param {{title:string}} title
     * @return {TodoList}
     */
    addItem({title}) {
        const todoItem = new TodoItem({title});
        this._items.push(todoItem);
        return todoItem;
    }

    toggleCompleteAll() {
        this.getAllTodoItems().forEach(item => {
            return this.toggleComplete(item.id);
        });
    }

    toggleComplete(id) {
        const item = this.getItem(id);
        item.completed = !item.completed;
        this.updateItem(item);
        return item;
    }

    removeItem(id) {
        const item = this.getItem(id);
        const index = this._items.indexOf(item);
        this._items.splice(index, 1);
        return item;
    }

    removeAllCompletedItems() {
        this.getAllTodoItems()
            .filter(item => item.completed)
            .forEach(item => {
                return this.removeItem(item.id);
            });
    }
}