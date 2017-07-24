"use strict";
import { DispatchedPayload, Store } from "almin";
import TodoState, { FilterTypes } from "./TodoState";
import { TodoListRepository } from "../../infra/TodoListRepository";
export default class TodoStore extends Store {
    private todoListRepository: TodoListRepository;

    /**
     * @param {TodoListRepository} todoListRepository
     */
    constructor({ todoListRepository }: { todoListRepository: TodoListRepository }) {
        super();
        // Initial State
        this.state = new TodoState({
            items: [],
            filterType: FilterTypes.ALL_TODOS
        });
        this.todoListRepository = todoListRepository;
    }

    // Update state
    receivePayload(payload: DispatchedPayload) {
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
