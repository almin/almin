// LICENSE : MIT
"use strict";
export class AppLocator {
    constructor() {
        /**
         * @type {Context}
         * @private
         */
        this._context = null;
        /**
         * @type {Customer}
         * @private
         */
        this._customer = null;
    }
    /**
     * @returns {Customer}
     */
    get customer() {
        return this._customer;
    }

    /**
     * @param {Customer} newCustomer
     */
    set customer(newCustomer) {
        this._customer = newCustomer;
    }
    /**
     * @returns {Context}
     */
    get context() {
        return this._context;
    }

    /**
     * @param {Context} newContext
     */
    set context(newContext) {
        this._context = newContext;
    }
}

export default new AppLocator();