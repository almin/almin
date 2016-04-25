// LICENSE : MIT
"use strict";
import {Store} from "almin";
import TodoState from "./TodoState";
export default class TodoStore extends Store {
    constructor({todoRepository}) {
        this.state = new TodoState();
        todoRepository.onChange(() => {
            const todoList = todoRepository.lastUsed();
            const newState = new TodoState(todoList);
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