// LICENSE : MIT
"use strict";
import {UseCase} from "almin";
import TodoBackendServer from "../domain/TodoList/TodoBackendServer"
import todoListRepository, {TodoListRepository} from "../infra/TodoRepository"
export class AddTodoItemFactory {
    static create() {
        const todoBackendServer = new TodoBackendServer();
        return new AddTodoItemUseCase({
            todoListRepository,
            todoBackendServer
        });
    }
}

export class AddTodoItemUseCase extends UseCase {
    /**
     * @param {TodoListRepository} todoListRepository
     * @param {TodoBackendServer} todoBackendServer
     */
    constructor({todoListRepository, todoBackendServer}) {
        super();
        this.todoListRepository = todoListRepository;
        this.todoBackendServer = todoBackendServer;
    }

    execute({title}) {
        const todoList = this.todoListRepository.lastUsed();
        const todoItem = todoList.addItem({title});
        // if saving is success, store to repository
        // other case, drop temporary change
        return this.todoBackendServer.add(todoItem).then(() => {
            this.todoListRepository.save(todoList);
        });
    }
}