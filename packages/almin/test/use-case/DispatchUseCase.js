// MIT © 2017 azu
"use strict";
import { UseCase } from "../../lib/UseCase";
export class DispatchUseCase extends UseCase {
    /**
     * @param {Payload} payload
     */
    execute(payload) {
        this.dispatch(payload);
    }
}