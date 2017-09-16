// @flow
"use strict";

const uuid = require("uuid");
export type TodoItemObjectT = {
    id: string,
    title: string,
    completed: boolean
};
export default class TodoItem {
    id: string;
    title: string;
    completed: boolean;

    constructor({ id, title, completed }: { id?: string, title: string, completed?: boolean }) {
        this.id = id || uuid.v4();
        this.title = title;
        this.completed = completed || false;
    }

    updateItem(updated: $Shape<TodoItemObjectT>): TodoItem {
        return new TodoItem(Object.assign({}, (this: any), updated));
    }
}
