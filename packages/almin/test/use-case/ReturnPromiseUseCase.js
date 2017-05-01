// MIT © 2017 azu
"use strict";
import { UseCase } from "../../lib/UseCase";
export default class ReturnPromiseUseCase extends UseCase {
    execute() {
        return Promise.resolve("value");
    }
}
