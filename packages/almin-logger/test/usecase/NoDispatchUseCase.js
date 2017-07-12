// LICENSE : MIT
"use strict";
import { UseCase } from "almin";
export default class NoDispatchUseCase extends UseCase {
    constructor() {
        super();
        this.name = "NoDispatchUseCase";
    }

    execute() {}
}
