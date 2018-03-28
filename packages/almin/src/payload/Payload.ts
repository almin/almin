// LICENSE : MIT
"use strict";
export abstract class Payload<T = any> {
    /**
     * `type` is unique property of the payload.
     * A `type` property which may not be `undefined`
     * It is a good idea to use string constants or Symbol for payload types.
     */
    abstract readonly type: T;
}
