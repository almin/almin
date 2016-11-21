// LICENSE : MIT
"use strict";
export default class Payload {
    /**
     * @param {*} type
     */
    constructor({ type }) {
        /**
         * `type` is unique property of the payload.
         * A `type` property which may not be `undefined`
         * It is a good idea to use string constants or Symbol for payload types.
         * @type {*}
         * @public
         */
        this.type = type;
    }
}