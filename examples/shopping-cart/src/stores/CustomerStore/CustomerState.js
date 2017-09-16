// LICENSE : MIT
"use strict";
import Customer from "../../domain/Customer/Customer";
export default class CustomerState {
    /**
     * @param {Customer} customer
     */
    constructor(customer = {}) {
        this.name = customer.name;
    }
}
