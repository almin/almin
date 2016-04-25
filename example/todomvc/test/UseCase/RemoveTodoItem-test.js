// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import {MemoryDB} from "../../src/js/infra/adpter/MemoryDB";
import TodoBackendServer from "../../src/js/domain/TodoList/TodoBackendServer";
import TodoList from "../../src/js/domain/TodoList/TodoList";
import {TodoListRepository} from "../../src/js/infra/TodoRepository";
import {RemoveTodoItemUseCase} from "../../src/js/UseCase/RemoveTodoItem";
describe("RemoveTodoItemUseCase", function () {
    it("emit Change", function () {
        const mockTodoList = new TodoList();
        const existingTodoItem = mockTodoList.addItem({title: "before "});
        // prepare
        const todoListRepository = new TodoListRepository(new MemoryDB());
        todoListRepository.save(mockTodoList);
        const todoBackendServer = new TodoBackendServer({backendPoint: null});
        todoBackendServer.remove = () => Promise.resolve();
        // initialize
        const useCase = new RemoveTodoItemUseCase({
            todoListRepository,
            todoBackendServer
        });
        todoListRepository.onChange(() => {
            const todoList = todoListRepository.lastUsed();
            assert.equal(todoList.getAllTodoItems().length, 0);
        });
        return useCase.execute({itemId: existingTodoItem.id}).then(() => {
            // re-get todoList
            const storedTodoList = todoListRepository.find(mockTodoList);
            assert(!storedTodoList.hasItem(existingTodoItem.id));
        });
    });
    it("should add TodoItem with title", function () {
        const mockTodoList = new TodoList();
        const existingTodoItem = mockTodoList.addItem({title: "before "});
        // prepare
        const todoListRepository = new TodoListRepository(new MemoryDB());
        todoListRepository.save(mockTodoList);
        const todoBackendServer = new TodoBackendServer({backendPoint: null});
        todoBackendServer.remove = () => Promise.resolve();
        // initialize
        const useCase = new RemoveTodoItemUseCase({
            todoListRepository,
            todoBackendServer
        });
        return useCase.execute({itemId: existingTodoItem.id}).then(() => {
            // re-get todoList
            const storedTodoList = todoListRepository.find(mockTodoList);
            assert(!storedTodoList.hasItem(existingTodoItem.id));
        });
    });
});