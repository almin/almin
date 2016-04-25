// LICENSE : MIT
"use strict";
import todoListRepository, {TodoListRepository} from "../infra/TodoRepository"
export class UpdateTodoItemTitleFactory {
    static create() {
        const todoBackendServer = new TodoBackendServer();
        return new UpdateTodoItemTitleUseCase({
            todoListRepository
        });
    }
}

export class UpdateTodoItemTitleUseCase {
    /**
     * @param {TodoListRepository} todoListRepository
     */
    constructor({todoListRepository}) {
        this.todoListRepository = todoListRepository;
    }

    execute({itemId, title}) {
        const todoList = this.todoListRepository.lastUsed();
        if (!todoList.hasItem(itemId)) {
            return Promise.reject(new Error("Not found item:" + itemId));
        }
        todoList.updateItem({id: itemId, title});
        this.todoListRepository.save(todoList);
    }
}