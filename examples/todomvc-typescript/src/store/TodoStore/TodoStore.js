"use strict";
import { Store } from "almin";
import TodoState, { FilterTypes } from "./TodoState";
export default class TodoStore extends Store {
    /**
     * @param {TodoListRepository} todoListRepository
     */
    constructor({ todoListRepository }) {
        super();
        // Initial State
        this.state = new TodoState({
            items: [],
            filterType: FilterTypes.ALL_TODOS
        });
        this.todoListRepository = todoListRepository;
    }

    // Update state
    receivePayload(payload) {
        const todoList = this.todoListRepository.lastUsed();
        if (!todoList) {
            return;
        }
        const newState = this.state.merge(todoList).reduce(payload);
        this.setState(newState);
    }

    // Read state
    getState() {
        return this.state;
    }
}
