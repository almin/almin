// LICENSE : MIT
"use strict";
import { Context } from "almin";
export class AppContextLocator {
    private _context: null | Context<any>;

    constructor() {
        /**
         * @type {Context}
         * @private
         */
        this._context = null;
    }

    /**
     * @returns {Context}
     */
    get context(): Context<any> {
        return this._context!;
    }

    /**
     * @param {Context} newContext
     */
    set context(newContext) {
        this._context = newContext;
    }
}

export default new AppContextLocator();
