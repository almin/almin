"use strict";
const REPOSITORY_CHANGE = "REPOSITORY_CHANGE";
import { EventEmitter } from "events";
import TodoList from "../domain/TodoList/TodoList";
import MemoryDB from "./adpter/MemoryDB";

// Collection repository
export class TodoListRepository extends EventEmitter {
    private _database: MemoryDB<string, TodoList>;

    constructor(database = new MemoryDB<string, TodoList>()) {
        super();
        this._database = database;
    }

    /**
     * @param id
     * @private
     */
    _get(id: string) {
        // Domain.<id>
        return this._database.get(`${TodoList.name}.${id}`);
    }

    find(todoList: TodoList) {
        return this._get(todoList.id);
    }

    /**
     * @returns {TodoList|undefined}
     */
    lastUsed(): TodoList {
        const todoList = this._database.get(`${TodoList.name}.lastUsed`);
        if (todoList) {
            const prevTodoList = this._get(todoList.id);
            if (prevTodoList) {
                return prevTodoList;
            }
        }
        // default list
        return new TodoList();
    }

    /**
     * @param {TodoList} todoList
     */
    save(todoList: TodoList) {
        this._database.set(`${TodoList.name}.lastUsed`, todoList);
        this._database.set(`${TodoList.name}.${todoList.id}`, todoList);
        this.emit(REPOSITORY_CHANGE, todoList);
    }

    /**
     * @param {TodoList} todoList
     */
    remove(todoList: TodoList) {
        this._database.delete(`${TodoList.name}.${todoList.id}`);
        this.emit(REPOSITORY_CHANGE);
    }

    onChange(handler: () => void) {
        this.on(REPOSITORY_CHANGE, handler);
    }
}

// singleton
export default new TodoListRepository();
