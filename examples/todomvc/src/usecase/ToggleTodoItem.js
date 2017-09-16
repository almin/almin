"use strict";
import { UseCase } from "almin";
import todoListRepository, { TodoListRepository } from "../infra/TodoListRepository";
export class ToggleTodoItemFactory {
    static create() {
        return new ToggleTodoItemUseCase({
            todoListRepository
        });
    }
}

export class ToggleTodoItemUseCase extends UseCase {
    /**
     * @param {TodoListRepository} todoListRepository
     */
    constructor({ todoListRepository }) {
        super();
        this.todoListRepository = todoListRepository;
    }

    execute(itemId) {
        const todoList = this.todoListRepository.lastUsed();
        todoList.toggleComplete(itemId);
        this.todoListRepository.save(todoList);
    }
}
