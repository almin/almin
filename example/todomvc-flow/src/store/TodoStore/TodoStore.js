// @flow
"use strict";
import {Store} from "almin";
import type {DispatcherPayload} from 'almin';
import TodoState from "./TodoState";
import TodoList from '../../domain/TodoList/TodoList';
import typeof TodoListRepository from '../../infra/TodoListRepository';
export default class TodoStore extends Store {
    state: TodoState;

    constructor({todoListRepository}: {todoListRepository: TodoListRepository}) {
        super();
        this.state = new TodoState();
        // when todoRepository is changed, try to update state
        todoListRepository.onChange(this._onChange.bind(this));
        // when UseCase dispatch event, try to update state
        this.onDispatch(this._onDispatch.bind(this));
    }

    getState(): {todoState: TodoState} {
        return {
            todoState: this.state
        }
    }

    /**
     * set newState if the state is changed
     * @param {TodoState} newState
     * @private
     */
    _setState(newState: TodoState): void {
        if (newState !== this.state) {
            this.state = newState;
            this.emitChange();
        }
    }

    /**
     * @param {TodoList} todoList
     * @private
     */
    _onChange(todoList: TodoList): void {
        const newState = this.state.merge(todoList);
        this._setState(newState);
    }

    /**
     * @param {DispatcherPayload} payload
     * @private
     */
    _onDispatch(payload: DispatcherPayload): void {
        const newState = this.state.reduce(payload);
        this._setState(newState);
    }
}
