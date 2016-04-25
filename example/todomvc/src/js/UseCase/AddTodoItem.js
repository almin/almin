// LICENSE : MIT
"use strict";
import {UseCase} from "almin";
import todoListRepository, {TodoListRepository} from "../infra/TodoRepository"
export class AddTodoItemFactory {
    static create() {
        return new AddTodoItemUseCase({
            todoListRepository
        });
    }
}

export class AddTodoItemUseCase extends UseCase {
    /**
     * @param {TodoListRepository} todoListRepository
     */
    constructor({todoListRepository}) {
        super();
        this.todoListRepository = todoListRepository;
    }

    execute(title) {
        const todoList = this.todoListRepository.lastUsed();
        todoList.addItem({title});
        this.todoListRepository.save(todoList);
    }
}