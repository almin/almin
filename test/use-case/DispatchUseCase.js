// MIT © 2017 azu
"use strict";
import UseCase from "../../src/UseCase";
export default class DispatchUseCase extends UseCase {
    /**
     * @param {Payload} payload
     */
    execute(payload) {
        this.dispatch(payload);
    }
}