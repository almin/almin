// LICENSE : MIT
"use strict";
import { UseCase } from "../../src";
export class AsyncErrorUseCase extends UseCase {
    execute() {
        return Promise.reject(new Error("error"));
    }
}
