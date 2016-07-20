// LICENSE : MIT
"use strict";
import {UseCase} from "almin";
export default class ErrorUseCase extends UseCase {
    execute() {
        return Promise.reject(new Error("fail"));
    }
}