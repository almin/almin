// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import TodoList from "../../src/domain/TodoList/TodoList";
import TodoItem from "../../src/domain/TodoList/TodoItem";
import TodoStore from "../../src/store/TodoStore/TodoStore";
import TodoState, {FilterTypes} from "../../src/store/TodoStore/TodoState";
import {FilterTodoListUseCase} from "../../src/usecase/FilterTodoList";
import {TodoListRepository} from "../../src/infra/TodoListRepository";
describe("TodoStore", function () {
    context("when repository is changed", function () {
        it("should return todoState", function (done) {
            const todoList = new TodoList();
            const todoListRepository = new TodoListRepository();
            const store = new TodoStore({todoListRepository});
            // then
            store.onChange(() => {
                const {todoState} = store.getState();
                assert(todoState instanceof TodoState);
                done();
            });
            // when
            todoListRepository.save(todoList);
        });
    });
    context("when TodoList has todo", function () {
        it("should return todoState that has todo item also", function (done) {
            const todoList = new TodoList();
            const todoItem = new TodoItem({title: "Read It Later"});
            todoList.addItem(todoItem);
            const todoListRepository = new TodoListRepository();
            const store = new TodoStore({todoListRepository});
            // then
            store.onChange(() => {
                const {todoState} = store.getState();
                assert.equal(todoState.items.length, 1);
                const [todoItem] = todoState.items;
                assert.equal(todoItem.title, "Read It Later");
                done();
            });
            // when
            todoListRepository.save(todoList);
        });
    });
    context("when dispatch events", function () {
        it("should update State", function (done) {
            const todoList = new TodoList();
            const todoListRepository = new TodoListRepository();
            todoListRepository.save(todoList);
            const store = new TodoStore({todoListRepository});
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