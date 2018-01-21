// MIT © 2017 azu
"use strict";
import { UseCase } from "../../src";
import { DispatchedPayload } from "../../src";

export class DispatchUseCase extends UseCase {
    /**
     * @param {Payload} payload
     */
    execute(payload: DispatchedPayload) {
        this.dispatch(payload);
    }
}
