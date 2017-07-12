// LICENSE : MIT
"use strict";
import { UseCase } from "almin";
export default class DecrementalCounterUseCase extends UseCase {
    // IncrementalCounterUseCase dispatch event ----> Store
    // UseCase should implement #execute method
    execute() {
        this.dispatch({
            type: DecrementalCounterUseCase.name
        });
    }
}
