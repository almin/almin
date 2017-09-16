"use strict";
import { UseCase } from "almin";
import todoListRepository, { TodoListRepository } from "../infra/TodoListRepository";
export class RemoveTodoItemFactory {
    static create() {
        return new RemoveTodoItemUseCase({
            todoListRepository
        });
    }
}

export class RemoveTodoItemUseCase extends UseCase {
    /**
     * @param {TodoListRepository} todoListRepository
     */
    constructor({ todoListRepository }) {
        super();
        this.todoListRepository = todoListRepository;
    }

    execute() {
        const todoList = this.todoListRepository.lastUsed();
        todoList.removeAllCompletedItems();
        this.todoListRepository.save(todoList);
    }
}
