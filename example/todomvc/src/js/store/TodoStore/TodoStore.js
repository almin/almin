// LICENSE : MIT
"use strict";
import {Store} from "almin";
import TodoState from "./TodoState";
export default class TodoStore extends Store {
    constructor({todoRepository}) {
        super();
        this.state = new TodoState();
        todoRepository.onChange(() => {
            const todoList = todoRepository.lastUsed();
            const newState = this.state.merge(todoList);
            if (newState !== this.state) {
                this.state = newState;
                this.emitChange();
            }
        });
        this.onDispatch(payload => {
            const newState = this.state.reduce(payload);
            if (newState !== this.state) {
                this.state = newState;
                this.emitChange();
            }
        });
    }

    getState() {
        return {
            TodoState: this.state
        }
    }
}