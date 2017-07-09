// MIT © 2017 azu
import { Payload } from "./Payload";

/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "Almin__InitializedPayload__";

/**
 * Initialized Payload
 * This is exported for an unit testing.
 * DO NOT USE THIS in your application.
 */
export class InitializedPayload extends Payload {
    constructor() {
        super({ type: TYPE });
    }
}

export const isInitializedPayload = (v: any): v is InitializedPayload => {
    return v.type === TYPE;
};
