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
    private todoListRepository: TodoListRepository;

    /**
     * @param {TodoListRepository} todoListRepository
     */
    constructor({ todoListRepository }: { todoListRepository: TodoListRepository }) {
        this.todoListRepository = todoListRepository;
    }

    execute({ id, title }: { id: string; title: string }) {
        const todoList = this.todoListRepository.lastUsed();
        if (!todoList.hasItem(id)) {
            return Promise.reject(new Error(`Not found item:${id}`));
        }
        todoList.updateItem({ id, title });
        this.todoListRepository.save(todoList);
        return;
    }
}
