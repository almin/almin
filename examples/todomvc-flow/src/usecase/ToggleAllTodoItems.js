// @flow
"use strict";
import { UseCase } from "almin";
import todoListRepository, { TodoListRepository } from "../infra/TodoListRepository";
export class ToggleAllTodoItemFactory {
    static create(): ToggleAllTodoItemUseCase {
        return new ToggleAllTodoItemUseCase({
            todoListRepository
        });
    }
}

export class ToggleAllTodoItemUseCase extends UseCase {
    todoListRepository: TodoListRepository;

    /**
     * @param {TodoListRepository} todoListRepository
     */
    constructor({ todoListRepository }: { todoListRepository: TodoListRepository }) {
        super();
        this.todoListRepository = todoListRepository;
    }

    execute(): void {
        const todoList = this.todoListRepository.lastUsed();
        if (todoList == null) {
            return;
        }
        todoList.toggleCompleteAll();
        this.todoListRepository.save(todoList);
    }
}
