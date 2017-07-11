// LICENSE : MIT
"use strict";
import { UseCase } from "../../lib/UseCase";
export class ErrorUseCase extends UseCase {
    execute() {
        return Promise.reject(new Error("error"));
    }
}
