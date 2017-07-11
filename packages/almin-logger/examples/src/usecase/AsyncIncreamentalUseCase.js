// LICENSE : MIT
"use strict";
import { UseCase } from "almin";
import IncrementalCounterUseCase from "./IncrementalCounterUseCase";
export default class AsyncIncreamentalUseCase extends UseCase {
    // IncrementalCounterUseCase dispatch event ----> Store
    // UseCase should implement #execute method
    execute() {
        return Promise.resolve().then(() => {
            return this.context.useCase(new IncrementalCounterUseCase()).execute();
        });
    }
}
