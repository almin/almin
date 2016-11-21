// LICENSE : MIT
"use strict";
export default class Payload {
    /**
     * @param {*} type
     */
    constructor({ type }) {
        /**
         * @type {*}
         * @public
         */
        this.type = type;
    }
}