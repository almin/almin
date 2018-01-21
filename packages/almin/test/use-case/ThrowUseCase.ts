// LICENSE : MIT
"use strict";
import { UseCase } from "../../src";
export class ThrowUseCase extends UseCase {
    execute() {
        // throw Error insteadof returning rejected promise
        throw new Error("error");
    }
}
