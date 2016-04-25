// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import {MemoryDB} from "../../src/js/infra/adpter/MemoryDB";
import TodoList from "../../src/js/domain/TodoList/TodoList";
import {TodoListRepository} from "../../src/js/infra/TodoRepository";
import {UpdateTodoItemTitleUseCase} from "../../src/js/UseCase/UpdateTodoItemTitle";
describe("UpdateTodoItem", function () {
    it("should add TodoItem with title", function (done) {
        const mockTodoList = new TodoList();
        const existingTodoItem = mockTodoList.addItem({title: "before "});
        // prepare
        const todoListRepository = new TodoListRepository(new MemoryDB());
        todoListRepository.save(mockTodoList);
        // initialize
        const useCase = new UpdateTodoItemTitleUseCase({
            todoListRepository
        });
        const titleOfUPDATING = "UPDATING TODO";
        // Then
        todoListRepository.onChange(() => {
            // re-get todoList
            const storedTodoList = todoListRepository.find(mockTodoList);
            const todoItem = storedTodoList.getItem(existingTodoItem.id);
            assert(todoItem);
            assert.equal(todoItem.title, titleOfUPDATING);
            done()
        });
        // When
        useCase.execute({itemId: existingTodoItem.id, title: titleOfUPDATING});
    });
});