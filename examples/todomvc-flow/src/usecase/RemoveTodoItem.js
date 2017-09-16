// @flow
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
    todoListRepository: TodoListRepository;

    /**
     * @param {TodoListRepository} todoListRepository
     */
    constructor({ todoListRepository }: { todoListRepository: TodoListRepository }) {
        super();
        this.todoListRepository = todoListRepository;
    }

    execute(itemId: string): void {
        const todoList = this.todoListRepository.lastUsed();
        if (todoList == null) {
            return;
        }
        if (!todoList.hasItem(itemId)) {
            return this.throwError(new Error(`Not found item:${itemId}`));
        }
        todoList.removeItem(itemId);
        this.todoListRepository.save(todoList);
    }
}
