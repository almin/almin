// MIT © 2017 azu
"use strict";
import { UseCase } from "../../lib/UseCase";
/*
 * This UseCase is helper for testing
 */
export class CallableUseCase extends UseCase {
    constructor() {
        super();
        this.isExecuted = false;
    }

    execute() {
        this.isExecuted = true;
    }
}
