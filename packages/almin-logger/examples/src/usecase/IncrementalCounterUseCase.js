// LICENSE : MIT
"use strict";
import { UseCase } from "almin";
export default class IncrementalCounterUseCase extends UseCase {
    // IncrementalCounterUseCase dispatch event ----> Store
    // UseCase should implement #execute method
    execute() {
        this.dispatch({
            type: IncrementalCounterUseCase.name
        });
    }
}
