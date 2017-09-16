// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import MemoryDB from "../../src/infra/adpter/MemoryDB";
import TodoItem from "../../src/domain/TodoList/TodoItem";
import TodoList from "../../src/domain/TodoList/TodoList";
import { TodoListRepository } from "../../src/infra/TodoListRepository";
import { RemoveTodoItemUseCase } from "../../src/usecase/RemoveTodoItem";
describe("RemoveTodoItemUseCase", function() {
    it("should add TodoItem with title", function(done) {
        const mockTodoList = new TodoList();
        const todoItem = new TodoItem({ title: "before" });
        mockTodoList.addItem(todoItem);
        // prepare
        const todoListRepository = new TodoListRepository(new MemoryDB());
        todoListRepository.save(mockTodoList);
        const useCase = new RemoveTodoItemUseCase({
            todoListRepository
        });
        // Then
        todoListRepository.onChange(() => {
            // re-get todoList
            const storedTodoList = todoListRepository.find(mockTodoList);
            assert(!storedTodoList.hasItem(todoItem.id));
            done();
        });
        // When
        useCase.execute(todoItem.id);
    });
});
