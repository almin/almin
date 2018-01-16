// MIT © 2017 azu
import { Payload } from "./Payload";

/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
export const TYPE = "__ALMIN_INITIALIZED_PAYLOAD__";

/**
 * Initialized Payload
 * This is exported for an unit testing.
 * DO NOT USE THIS in your application.
 */
export class InitializedPayload implements Payload {
    type = TYPE;
}

export const isInitializedPayload = (v: any): v is InitializedPayload => {
    return v.type === TYPE;
};
