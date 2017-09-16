// @flow
"use strict";

import type { Context } from "almin";

export class AppContextLocator {
    _context: ?Context;

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
    get context(): Context {
        if (this._context == null) {
            throw new Error("Context is not set");
        }
        return this._context;
    }

    /**
     * @param {Context} newContext
     */
    set context(newContext: Context): void {
        this._context = newContext;
    }
}

export default new AppContextLocator();
