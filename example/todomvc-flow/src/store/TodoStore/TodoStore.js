// @flow
"use strict";
import { Store } from "almin";
import type { DispatcherPayload } from "almin";
import TodoState from "./TodoState";
import TodoList from "../../domain/TodoList/TodoList";
import typeof TodoListRepository from "../../infra/TodoListRepository";
export default class TodoStore extends Store {
    state: TodoState;

    constructor({ todoListRepository }: { todoListRepository: TodoListRepository }) {
        super();
        this.state = new TodoState();
        this.todoListRepository = todoListRepository;
    }

    receivePayload(payload: DispatcherPayload) {
        const todoList: TodoList = this.todoListRepository.lastUsed();
        if (!todoList) {
            return;
        }
        const newState = this.state.merge(todoList).reduce(payload);
        if (this.shouldStateUpdate(this.state, newState)) {
            this.state = newState;
        }
    }

    getState(): { todoState: TodoState } {
        return this.state;
    }
}
