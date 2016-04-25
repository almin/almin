// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import {MemoryDB} from "../../src/js/infra/adpter/MemoryDB";
import TodoBackendServer from "../../src/js/domain/TodoList/TodoBackendServer";
import TodoList from "../../src/js/domain/TodoList/TodoList";
import {TodoListRepository} from "../../src/js/infra/TodoRepository";
import {UpdateTodoItemTitleUseCase} from "../../src/js/UseCase/UpdateTodoItemTitle";
describe("UpdateTodoItem", function () {
    it("should add TodoItem with title", function () {
        const mockTodoList = new TodoList();
        const existingTodoItem = mockTodoList.addItem({title: "before "});
        // prepare
        const todoListRepository = new TodoListRepository(new MemoryDB());
        todoListRepository.save(mockTodoList);
        const todoBackendServer = new TodoBackendServer({backendPoint: null});
        todoBackendServer.update = () => Promise.resolve();
        // initialize
        const useCase = new UpdateTodoItemTitleUseCase({
            todoListRepository,
            todoBackendServer
        });
        const titleOfUPDATING = "UPDATING TODO";
        return useCase.execute({itemId: existingTodoItem.id, title: titleOfUPDATING}).then(() => {
            // re-get todoList
            const storedTodoList = todoListRepository.find(mockTodoList);
            const todoItem = storedTodoList.getItem(existingTodoItem.id);
            assert(todoItem);
            assert.equal(todoItem.title, titleOfUPDATING);
        });
    });
});