// LICENSE : MIT
"use strict";
const assert = require("assert");
import TodoList from "../../lib/domain/TodoList/TodoList";
import { Context, Dispatcher } from "almin";
import TodoItem from "../../lib/domain/TodoList/TodoItem";
import TodoStore from "../../lib/store/TodoStore/TodoStore";
import TodoState, { FilterTypes } from "../../lib/store/TodoStore/TodoState";
import { FilterTodoListUseCase } from "../../lib/usecase/FilterTodoList";
import { TodoListRepository } from "../../lib/infra/TodoListRepository";
describe("TodoStore", function() {
    it("should return TodoState instance", function() {
        const todoListRepository = new TodoListRepository();
        const store = new TodoStore({ todoListRepository });
        // then
        const todoState = store.getState();
        assert(todoState instanceof TodoState);
    });
    context("when TodoList has todo", function() {
        it("should return todoState that has todo item also", function() {
            const todoList = new TodoList();
            const todoItem = new TodoItem({ title: "Read It Later" });
            todoList.addItem(todoItem);
            const initialState = new TodoState({
                items: [],
                filterType: FilterTypes.ALL_TODOS
            });
            // then
            const todoState = initialState.merge(todoList);
            assert.equal(todoState.items.length, 1);
            const [actualTodoItem] = todoState.items;
            assert.equal(actualTodoItem.title, "Read It Later");
        });
    });
    context("when dispatch events", function() {
        it("should update State", function() {
            const todoList = new TodoList();
            const todoListRepository = new TodoListRepository();
            todoListRepository.save(todoList);
            const store = new TodoStore({ todoListRepository });
            const initialState = store.getState();
            // assert initial state
            assert(initialState.filterType, FilterTypes.ALL_TODOS);
            // when
            const useCase = new FilterTodoListUseCase();
            const context = new Context({
                dispatcher: new Dispatcher(),
                store
            });
            // then
            return context
                .useCase(useCase)
                .execute(FilterTypes.COMPLETED_TODOS)
                .then(() => {
                    assert(store.getState().filterType, FilterTypes.COMPLETED_TODOS);
                });
        });
    });
});
