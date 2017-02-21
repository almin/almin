// @flow
"use strict";
const EventEmitter = require("events");
const REPOSITORY_CHANGE = "REPOSITORY_CHANGE";
import TodoList from "../domain/TodoList/TodoList";
import MemoryDB from "./adpter/MemoryDB";
// Collection repository
export class TodoListRepository extends EventEmitter {
    _database: MemoryDB;

    constructor(database: MemoryDB = new MemoryDB()) {
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
    _get(id: string): void {
        // Domain.<id>
        return this._database.get(`${TodoList.name}.${id}`);
    }

    find(todoList: TodoList): ?TodoList {
        return this._get(todoList.id);
    }

    /**
     * @returns {TodoList|undefined}
     */
    lastUsed(): TodoList {
        const todoList: TodoList = this._database.get(`${TodoList.name}.lastUsed`);
        if (todoList != null) {
            return this._get(todoList.id);
        } else {
            return new TodoList();
        }
    }

    /**
     * @param {TodoList} todoList
     */
    save(todoList: TodoList): void {
        this._database.set(`${TodoList.name}.lastUsed`, todoList);
        this._database.set(`${TodoList.name}.${todoList.id}`, todoList);
        this.emit(REPOSITORY_CHANGE, todoList);
    }

    /**
     * @param {TodoList} todoList
     */
    remove(todoList: TodoList): void {
        this._database.delete(`${TodoList.name}.${todoList.id}`);
        this.emit(REPOSITORY_CHANGE);
    }

    onChange(handler: Function): void {
        this.on(REPOSITORY_CHANGE, handler);
    }
}
// singleton
export default new TodoListRepository();
