// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import TodoList from "../../src/js/domain/TodoList/TodoList";
import TodoStore from "../../src/js/store/TodoStore/TodoStore";
import TodoState, {FilterTypes} from "../../src/js/store/TodoStore/TodoState";
import {FilterTodoListUseCase} from "../../src/js/usecase/FilterTodoList";
import {TodoListRepository} from "../../src/js/infra/TodoRepository";
describe("TodoStore", function () {
    context("when repository is changed", function () {
        it("should return todoState", function (done) {
            const todoList = new TodoList();
            const todoRepository = new TodoListRepository();
            const store = new TodoStore({todoRepository});
            // then
            store.onChange(() => {
                const {todoState} = store.getState();
                assert(todoState instanceof TodoState);
                done();
            });
            // when
            todoRepository.save(todoList);
        });
    });
    context("when TodoList has todo", function () {
        it("should return todoState that has todo item also", function (done) {
            const todoList = new TodoList();
            todoList.addItem("Read It Later");
            const todoRepository = new TodoListRepository();
            const store = new TodoStore({todoRepository});
            // then
            store.onChange(() => {
                const {todoState} = store.getState();
                assert.equal(todoState.items.length, 1);
                const [todoItem] = todoState.items;
                assert.equal(todoItem.title, "Read It Later");
                done();
            });
            // when
            todoRepository.save(todoList);
        });
    });
    context("when dispatch events", function () {
        it("should update State", function (done) {
            const todoList = new TodoList();
            const todoRepository = new TodoListRepository();
            todoRepository.save(todoList);
            const store = new TodoStore({todoRepository});
            const prevState = store.getState();
            assert(prevState.todoState.filterType, FilterTypes.ALL_TODOS);
            // then
            store.onChange(() => {
                const {todoState} = store.getState();
                assert.equal(prevState.todoState.filterType, FilterTypes.COMPLETED_TODOS);
                done();
            });
            // when
            const useCase = new FilterTodoListUseCase();
            // idiom: Delegate events to Store from UseCase
            useCase.pipe(store);
            useCase.execute(FilterTypes.COMPLETED_TODOS);
        });
    });
});