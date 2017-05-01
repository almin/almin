"use strict";
import { Store } from "almin";
import TodoState from "./TodoState";
export default class TodoStore extends Store {
    /**
     * @param {TodoListRepository} todoListRepository
     */
    constructor({ todoListRepository }) {
        super();
        this.state = new TodoState();
        this.todoListRepository = todoListRepository;
    }

    receivePayload(payload) {
        const todoList = this.todoListRepository.lastUsed();
        if (!todoList) {
            return;
        }
        const newState = this.state.merge(todoList).reduce(payload);
        this.setState(newState);
    }

    getState() {
        return this.state;
    }
}
