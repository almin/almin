// LICENSE : MIT
"use strict";
const fetch = require("isomorphic-fetch");
export default class TodoBackendServer {
    constructor({backendPoint}) {
        this.backendPoint = backendPoint;
    }

    add(todoItem) {
        return fetch(this.backendPoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(todoItem)
        }).then(response => {
            return response.json();
        });
    }

    update(todoItem) {
        return fetch(todoItem.url, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(todoItem)
        }).then(response => {
            return response.json();
        });
    }

    remove(todoItem) {
        return fetch(todoItem.url, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(todoItem)
        }).then(response => {
            return response.json();
        });
    }
};