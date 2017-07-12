// LICENSE : MIT
"use strict";
export class Payload {
    /**
     * `type` is unique property of the payload.
     * A `type` property which may not be `undefined`
     * It is a good idea to use string constants or Symbol for payload types.
     */
    readonly type: any;

    /**
     * @param {*} type
     */
    constructor({ type }: { type: any }) {
        this.type = type;
    }
}
