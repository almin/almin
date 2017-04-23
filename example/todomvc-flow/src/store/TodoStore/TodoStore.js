// @flow
"use strict";
import { Store } from "almin";
import type { DispatcherPayload } from "almin";
import TodoState from "./TodoState";
import typeof TodoListRepository from "../../infra/TodoListRepository";
export default class TodoStore extends Store {
    state: TodoState;
    todoListRepository: TodoListRepository;

    constructor({ todoListRepository }: { todoListRepository: TodoListRepository }) {
        super();
        this.state = new TodoState();
        this.todoListRepository = todoListRepository;
    }

    receivePayload(payload: DispatcherPayload) {
        const todoList = this.todoListRepository.lastUsed();
        if (!todoList) {
            return;
        }
        const newState = this.state.merge(todoList).reduce(payload);
        this.setState(newState);
    }

    getState(): TodoState {
        return this.state;
    }
}
