"use strict";
import { UseCase } from "almin";
import todoListRepository, { TodoListRepository } from "../infra/TodoListRepository";
import TodoItem from "../domain/TodoList/TodoItem";

export class AddTodoItemFactory {
    static create() {
        return new AddTodoItemUseCase({
            todoListRepository
        });
    }
}

export class AddTodoItemUseCase extends UseCase {
    private todoListRepository: TodoListRepository;

    /**
     * @param {TodoListRepository} todoListRepository
     */
    constructor({ todoListRepository }: { todoListRepository: TodoListRepository }) {
        super();
        this.todoListRepository = todoListRepository;
    }

    execute(title: string) {
        // Get todoList from repository
        const todoList = this.todoListRepository.lastUsed();
        // Create TodoItem
        const todoItem = new TodoItem({ title });
        // Add TodoItem
        todoList.addItem(todoItem);
        // Save todoList to  repository
        this.todoListRepository.save(todoList);
    }
}
