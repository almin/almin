"use strict";
import { UseCase } from "almin";

export class IncrementalCounterUseCase extends UseCase {
    // IncrementalCounterUseCase dispatch "increment" ----> Store
    // UseCase should implement #execute method
    execute() {
        this.dispatch({
            type: "increment"
        });
    }
}
