// @flow
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
    todoListRepository: TodoListRepository;

    /**
     * @param {TodoListRepository}todoListRepository
     */
    constructor({ todoListRepository }: { todoListRepository: TodoListRepository }) {
        super();
        this.todoListRepository = todoListRepository;
    }

    execute(): void {
        // initialize TodoList domain
        const todoList = new TodoList();
        this.todoListRepository.save(todoList);
    }
}
