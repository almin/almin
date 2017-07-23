"use strict";
import { UseCase } from "almin";
import TodoList from "../domain/TodoList/TodoList";
import todoListRepository, { TodoListRepository } from "../infra/TodoListRepository";

export class CreateDomainUseCaseFactory {
    static create() {
        return new CreateDomainUseCase({ todoListRepository });
    }
}

export class CreateDomainUseCase extends UseCase {
    /**
     * @param {TodoListRepository}todoListRepository
     */
    constructor({ todoListRepository }) {
        super();
        this.todoListRepository = todoListRepository;
    }

    execute() {
        // initialize TodoList domain
        const todoList = new TodoList();
        this.todoListRepository.save(todoList);
    }
}
