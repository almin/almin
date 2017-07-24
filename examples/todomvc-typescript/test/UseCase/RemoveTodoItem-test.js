// LICENSE : MIT
"use strict";
const assert = require("assert");
import MemoryDB from "../../lib/infra/adpter/MemoryDB";
import TodoItem from "../../lib/domain/TodoList/TodoItem";
import TodoList from "../../lib/domain/TodoList/TodoList";
import { TodoListRepository } from "../../lib/infra/TodoListRepository";
import { RemoveTodoItemUseCase } from "../../lib/usecase/RemoveTodoItem";
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
