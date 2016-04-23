// LICENSE : MIT
"use strict";
const uuid = require("uuid");
export default class Customer {
    constructor({name}) {
        this.id = uuid();
        this.name = name;
    }
}