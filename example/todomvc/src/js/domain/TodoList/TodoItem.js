// LICENSE : MIT
"use strict";
const uuid = require('uuid');
/*
 [
     {
         "completed": false,
         "order": 524,
         "title": "teast",
         "url": "http://todo-backend-express.herokuapp.com/6159"
     }
 ]
 */
export default class TodoItem {
    constructor({
        id,
        order,
        title,
        completed,
    }) {
        this.id = id || uuid();
        this.title = title;
        this.order = order;
        this.completed = completed;
    }

    updateItem(updated) {
        return new TodoItem(Object.assign(this, updated));
    }
}