// LICENSE : MIT
"use strict";
import {UseCase} from "almin";
import TodoBackendServer from "../domain/TodoList/TodoBackendServer"
import todoListRepository, {TodoListRepository} from "../infra/TodoRepository"
export class RemoveTodoItemFactory {
    static create() {
        const todoBackendServer = new TodoBackendServer();
        return new RemoveTodoItemUseCase({
            todoListRepository,
            todoBackendServer
        });
    }
}

export class RemoveTodoItemUseCase extends UseCase {
    /**
     * @param {TodoListRepository} todoListRepository
     * @param {TodoBackendServer} todoBackendServer
     */
    constructor({todoListRepository, todoBackendServer}) {
        super();
        this.todoListRepository = todoListRepository;
        this.todoBackendServer = todoBackendServer;
    }

    execute({itemId}) {
        const todoList = this.todoListRepository.lastUsed();
        if (!todoList.hasItem(itemId)) {
            return Promise.reject(new Error("Not found item:" + itemId));
        }
        const todoItem = todoList.getItem(it);
        todoList.removeItem(itemId);
        // if saving is success, store to repository
        // other case, drop temporary change
        return this.todoBackendServer.remove(todoItem).then(() => {
            this.todoListRepository.save(todoList);
        });
    }
}