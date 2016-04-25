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
        completed,
        order,
        title,
        url,
    }) {
        this.id = id || uuid.v1();
        this.title = title;
        this.order = order;
        this.url = url;
        this.completed = completed;
    }

    // value object always return new Value
    updateTitle(title) {
        return new TodoItem(Object.assign({}, this, {title}));
    }
}