// MIT © 2017 azu
"use strict";
import { UseCase } from "../../src";

/**
 * This is AsyncUseCase and this do not dispatch.
 */
export class AsyncUseCase extends UseCase {
    execute() {
        return Promise.resolve();
    }
}
