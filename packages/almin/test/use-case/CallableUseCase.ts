// MIT © 2017 azu
"use strict";
import { UseCase } from "../../src";
/*
 * This UseCase is helper for testing
 */
export class CallableUseCase extends UseCase {
    public isExecuted: boolean;
    constructor() {
        super();
        this.isExecuted = false;
    }

    execute() {
        this.isExecuted = true;
    }
}
