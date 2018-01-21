// LICENSE : MIT
"use strict";
import { UseCase } from "../../src";
export class ErrorUseCase extends UseCase {
    execute() {
        return Promise.reject(new Error("error"));
    }
}
