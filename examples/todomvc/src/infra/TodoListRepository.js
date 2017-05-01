"use strict";
const EventEmitter = require("events");
const REPOSITORY_CHANGE = "REPOSITORY_CHANGE";
import TodoList from "../domain/TodoList/TodoList";
import MemoryDB from "./adpter/MemoryDB";
// Collection repository
export class TodoListRepository extends EventEmitter {
    constructor(database = new MemoryDB()) {
        super();
        /**
         * @type {MemoryDB}
         */
        this._database = database;
    }

    /**
     * @param id
     * @private
     */
    _get(id) {
        // Domain.<id>
        return this._database.get(`${TodoList.name}.${id}`);
    }

    find(todoList) {
        return this._get(todoList.id);
    }

    /**
     * @returns {TodoList|undefined}
     */
    lastUsed() {
        const todoList = this._database.get(`${TodoList.name}.lastUsed`);
        if (todoList) {
            return this._get(todoList.id);
        }
    }

    /**
     * @param {TodoList} todoList
     */
    save(todoList) {
        this._database.set(`${TodoList.name}.lastUsed`, todoList);
        this._database.set(`${TodoList.name}.${todoList.id}`, todoList);
        this.emit(REPOSITORY_CHANGE, todoList);
    }

    /**
     * @param {TodoList} todoList
     */
    remove(todoList) {
        this._database.delete(`${TodoList.name}.${todoList.id}`);
        this.emit(REPOSITORY_CHANGE);
    }

    onChange(handler) {
        this.on(REPOSITORY_CHANGE, handler);
    }
}
// singleton
export default new TodoListRepository();
