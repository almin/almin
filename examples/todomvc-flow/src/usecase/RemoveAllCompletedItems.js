// @flow
"use strict";
import { UseCase } from "almin";
import todoListRepository, { TodoListRepository } from "../infra/TodoListRepository";
export class RemoveTodoItemFactory {
    static create(): RemoveTodoItemUseCase {
        return new RemoveTodoItemUseCase({
            todoListRepository
        });
    }
}

export class RemoveTodoItemUseCase extends UseCase {
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
        todoList.removeAllCompletedItems();
        this.todoListRepository.save(todoList);
    }
}
