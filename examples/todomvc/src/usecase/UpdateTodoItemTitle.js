"use strict";
import todoListRepository, { TodoListRepository } from "../infra/TodoListRepository";
export class UpdateTodoItemTitleFactory {
    static create() {
        return new UpdateTodoItemTitleUseCase({
            todoListRepository
        });
    }
}

export class UpdateTodoItemTitleUseCase {
    /**
     * @param {TodoListRepository} todoListRepository
     */
    constructor({ todoListRepository }) {
        this.todoListRepository = todoListRepository;
    }

    execute({ id, title }) {
        const todoList = this.todoListRepository.lastUsed();
        if (!todoList.hasItem(id)) {
            return Promise.reject(new Error(`Not found item:${id}`));
        }
        todoList.updateItem({ id, title });
        this.todoListRepository.save(todoList);
    }
}
