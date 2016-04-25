// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import {MemoryDB} from "../../src/js/infra/adpter/MemoryDB";
import TodoBackendServer from "../../src/js/domain/TodoList/TodoBackendServer";
import TodoList from "../../src/js/domain/TodoList/TodoList";
import {TodoListRepository} from "../../src/js/infra/TodoRepository";
import {AddTodoItemUseCase} from "../../src/js/UseCase/AddTodoItem";
describe("AddTodoItem", function () {
    context("when success posting server", function () {
        let todoBackendServer;
        beforeEach(function () {
            todoBackendServer = new TodoBackendServer({backendPoint: null});
            todoBackendServer.add = () => Promise.resolve();
        });
        it("should add TodoItem with title", function () {
            const mockTodoList = new TodoList();
            // prepare
            const todoListRepository = new TodoListRepository(new MemoryDB());
            todoListRepository.save(mockTodoList);
            // initialize
            const useCase = new AddTodoItemUseCase({
                todoListRepository,
                todoBackendServer
            });
            const titleOfAdding = "ADDING TODO";
            return useCase.execute({title: titleOfAdding}).catch(() => {
                const storedTodoList = todoListRepository.find(mockTodoList);
                assert.equal(storedTodoList.getAllTodoItems().length, 1);
            });
        });
    });
    context("when failure posting server", function () {
        let todoBackendServer;
        beforeEach(function () {
            todoBackendServer = new TodoBackendServer({backendPoint: null});
            todoBackendServer.add = () => Promise.reject(new Error("server error"));
        });
        it("should add TodoItem with title", function () {
            const mockTodoList = new TodoList();
            // prepare
            const todoListRepository = new TodoListRepository(new MemoryDB());
            todoListRepository.save(mockTodoList);
            // initialize
            const useCase = new AddTodoItemUseCase({
                todoListRepository,
                todoBackendServer
            });
            const titleOfAdding = "ADDING TODO";
            return useCase.execute({title: titleOfAdding}).catch(() => {
                // not saved
                const storedTodoList = todoListRepository.find(mockTodoList);
                assert.equal(storedTodoList.getAllTodoItems().length, 0);
            });
        });
    });

    it("should add TodoItem with title", function () {
        const mockTodoList = new TodoList();
        // prepare
        const todoListRepository = new TodoListRepository(new MemoryDB());
        todoListRepository.save(mockTodoList);
        const todoBackendServer = new TodoBackendServer({backendPoint: null});
        todoBackendServer.add = () => Promise.resolve();
        // initialize
        const useCase = new AddTodoItemUseCase({
            todoListRepository,
            todoBackendServer
        });
        const titleOfAdding = "ADDING TODO";
        return useCase.execute({title: titleOfAdding}).then(() => {
            // re-get todoList
            const storedTodoList = todoListRepository.find(mockTodoList);
            const todoItem = storedTodoList.getAllTodoItems()[0];
            assert.equal(todoItem.title, titleOfAdding);
        });
    });

});