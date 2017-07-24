// LICENSE : MIT
"use strict";
const assert = require("assert");
import MemoryDB from "../../lib/infra/adpter/MemoryDB";
import TodoList from "../../lib/domain/TodoList/TodoList";
import { TodoListRepository } from "../../lib/infra/TodoListRepository";
import { AddTodoItemUseCase } from "../../lib/usecase/AddTodoItem";
describe("AddTodoItem", function() {
    it("should add TodoItem with title", function() {
        const mockTodoList = new TodoList();
        // prepare
        const todoListRepository = new TodoListRepository(new MemoryDB());
        todoListRepository.save(mockTodoList);
        // initialize
        const useCase = new AddTodoItemUseCase({
            todoListRepository
        });
        const titleOfAdding = "ADDING TODO";
        // Then
        todoListRepository.onChange(() => {
            // re-get todoList
            const storedTodoList = todoListRepository.find(mockTodoList);
            const todoItem = storedTodoList.getAllTodoItems()[0];
            assert.equal(todoItem.title, titleOfAdding);
        });
        // When
        useCase.execute(titleOfAdding);
    });
});
