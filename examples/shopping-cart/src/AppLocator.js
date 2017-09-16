// LICENSE : MIT
"use strict";
export class AppLocator {
    constructor() {
        /**
         * @type {Context}
         */
        this.context = null;
        /**
         * @type {Customer}
         */
        this.customer = null;

        /**
         * Almin logger
         * @type {AlminLogger}
         */
        this.alminLogger = null;
    }
}

export default new AppLocator();
