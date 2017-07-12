// LICENSE : MIT
"use strict";
import { UseCase } from "almin";
export default class ErrorUseCase extends UseCase {
    constructor() {
        super();
        this.name = "ErrorUseCase";
    }

    execute() {
        return Promise.reject(new Error("fail"));
    }
}
