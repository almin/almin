"use strict";
const uuid = require("uuid");
export interface TodoItemArgs {
    id?: string;
    title: string;
    completed: boolean;
}
export default class TodoItem {
    id: string;
    title: string;
    completed: boolean;

    constructor(args: TodoItemArgs) {
        this.id = args.id || uuid();
        this.title = args.title;
        this.completed = args.completed;
    }

    updateItem(updated: Partial<TodoItemArgs>) {
        return new TodoItem({
            ...this as TodoItem,
            ...updated
        });
    }
}
