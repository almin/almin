// MIT © 2017 azu
"use strict";
import { UseCase } from "almin";
export default class ThrowErrorUseCase extends UseCase {
    execute() {
        this.throwError(new Error("ERR!"));
    }
}
