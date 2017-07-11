// LICENSE : MIT
"use strict";
import { UseCase } from "almin";
export default class WrapUseCase extends UseCase {
    constructor() {
        super();
        this.name = "WrapUseCase";
    }

    /**
     * @param {function()} fn
     */
    execute(fn) {
        fn();
    }
}
