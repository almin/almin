// LICENSE : MIT
"use strict";
import {UseCase} from "almin";
import todoListRepository, {TodoListRepository} from "../infra/TodoRepository"
export class ToggleCompleteTodoItemFactory {
    static create() {
        return new ToggleCompleteTodoItemUseCase({
            todoListRepository
        });
    }
}

export class ToggleCompleteTodoItemUseCase extends UseCase {
    /**
     * @param {TodoListRepository} todoListRepository
     */
    constructor({todoListRepository}) {
        super();
        this.todoListRepository = todoListRepository;
    }

    execute({itemId}) {
        const todoList = this.todoListRepository.lastUsed();
        todoList.toggleCompleteAll();
        this.todoListRepository.save(todoList)
    }
}