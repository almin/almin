// LICENSE : MIT
"use strict";
import TodoList from "./TodoList";
import TodoItem from "./TodoItem";
export default class TodoListFactory {
    /**
     * @param {Object|TodoList} object
     * @returns {TodoList}
     */
    static create(object) {
        const todoList = new TodoList();
        todoList.id = object.id;
        todoList._items = object._items.map(item => new TodoItem(item));
        if (object.eventAggregator) {
            todoList.eventAggregator = object.eventAggregator;
        }
        return todoList;
    }
}