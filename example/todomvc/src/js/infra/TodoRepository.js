// LICENSE : MIT
"use strict";
const EventEmitter = require("events");
const REPOSITORY_CHANGE = "REPOSITORY_CHANGE";
import TodoListFactory from "../domain/TodoList/TodoListFactory";
import TodoList from "../domain/TodoList/TodoList";
import MemoryDB from "./adpter/MemoryDB";
const shallowClone = (todoList) => {
    const cloneObject = JSON.parse(JSON.stringify(todoList));
    return TodoListFactory.create(cloneObject);
};
// Collection repository
export class TodoListRepository extends EventEmitter {
    constructor(database) {
        super();
        /**
         * @type {MemoryDB}
         */
        this._database = database;
    }

    /**
     * データを取り出し、複製したモデルを返す
     * @param id
     * @private
     */
    _get(id) {
        // 本当はコンテキストを先頭に
        // Domain.<id>
        return shallowClone(this._database.get(`${TodoList.name}.${id}`));
    }

    find(todoList) {
        return this._get(todoList.id);
    }

    /**
     * @returns {TodoList|undefined}
     */
    lastUsed() {
        const todoList = this._database.get(`${TodoList.name}.lastUsed`);
        return this._get(todoList.id);
    }

    /**
     * @param {TodoList} todoList
     */
    save(todoList) {
        this._database.set(`${TodoList.name}.lastUsed`, todoList);
        this._database.set(`${TodoList.name}.${todoList.id}`, todoList);
        this.emit(REPOSITORY_CHANGE);
    }

    /**
     * @param {TodoList} todoList
     */
    remove(todoList) {
        this._database.delete(`${TodoList.name}.${todoList.id}`);
        this.emit(REPOSITORY_CHANGE);
    }

    onChange(handler){
        this.on(REPOSITORY_CHANGE, handler);
    }
}
// singleton
export default new TodoListRepository(MemoryDB);