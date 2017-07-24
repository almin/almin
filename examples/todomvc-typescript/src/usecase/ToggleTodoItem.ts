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
    private todoListRepository: TodoListRepository;

    /**
     * @param {TodoListRepository} todoListRepository
     */
    constructor({ todoListRepository }: { todoListRepository: TodoListRepository }) {
        super();
        this.todoListRepository = todoListRepository;
    }

    execute(itemId: string) {
        const todoList = this.todoListRepository.lastUsed();
        todoList.toggleComplete(itemId);
        this.todoListRepository.save(todoList);
    }
}
