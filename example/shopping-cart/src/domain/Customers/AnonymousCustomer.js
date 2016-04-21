// LICENSE : MIT
"use strict";
import Customer from "./Custormer";
export default class AnonymousCustomer extends Customer {
    constructor() {
        super({name: "Anonymous"});
    }
}