// LICENSE : MIT
"use strict";
import UseCase from "../../src/UseCase";
export default class ErrorUseCase extends UseCase {
    execute() {
        return Promise.reject(new Error("error"));
    }
}