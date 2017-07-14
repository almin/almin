// MIT © 2017 azu
"use strict";
import { UseCase } from "../../src/UseCase";
// async usecase
export default class ReturnPromiseUseCase extends UseCase {
    execute() {
        return Promise.resolve("value");
    }
}
