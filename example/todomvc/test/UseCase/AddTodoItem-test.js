// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import MemoryDB from "../../src/js/infra/adpter/MemoryDB";
import TodoList from "../../src/js/domain/TodoList/TodoList";
import {TodoListRepository} from "../../src/js/infra/TodoRepository";
import {AddTodoItemUseCase} from "../../src/js/usecase/AddTodoItem";
describe("AddTodoItem", function () {
    it("should add TodoItem with title", function () {
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