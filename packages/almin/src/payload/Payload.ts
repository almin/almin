// LICENSE : MIT
"use strict";

export interface PayloadArgs {
    type: any;
}

export abstract class Payload {
    /**
     * `type` is unique property of the payload.
     * A `type` property which may not be `undefined`
     * It is a good idea to use string constants or Symbol for payload types.
     */
    abstract readonly type: any;

    constructor(args?: PayloadArgs) {
        if (args) {
            this.type = args.type;
        }
    }
}
