// LICENSE : MIT
"use strict";
import Customer from "./Customer";
export default class AnonymousCustomer extends Customer {
    constructor() {
        super({ name: "Anonymous" });
    }
}
