"use strict";
export default class TodoState {
    /**
     * @param {TodoList} todoList
     */
    constructor(todoList) {
        /**
         * @type {TodoItem[]}
         */
        this.items = todoList ? todoList.getAllTodoItems() : [];
        this.areAllComplete = this.items.every(item => {
            return item.completed;
        });
    }
}