"use strict";
const uuid = require("uuid");
export default class TodoItem {
    constructor({ id, title, completed }) {
        this.id = id || uuid();
        this.title = title;
        this.completed = completed;
    }

    updateItem(updated) {
        return new TodoItem(Object.assign({}, this, updated));
    }
}
