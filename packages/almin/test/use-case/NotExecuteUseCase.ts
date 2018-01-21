// MIT © 2017 azu
"use strict";
import { UseCase } from "../../src";

export class NotExecuteUseCase extends UseCase {
    shouldExecute() {
        return false;
    }

    execute() {
        throw new Error("SHOULD NOT EXECUTE");
    }
}
