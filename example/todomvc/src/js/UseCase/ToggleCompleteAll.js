// LICENSE : MIT
"use strict";
import {UseCase} from "almin";
import todoListRepository, {TodoListRepository} from "../infra/TodoRepository"
export class ToggleCompleteAllTodoItemFactory {
    static create() {
        return new ToggleCompleteAllTodoItemUseCase({
            todoListRepository
        });
    }
}

export class ToggleCompleteAllTodoItemUseCase extends UseCase {
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