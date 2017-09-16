// MIT © 2017 azu
"use strict";
import { UseCase } from "almin";
import IncrementalCounterUseCase from "./IncrementalCounterUseCase";
import DecrementalCounterUseCase from "./DecrementalCounterUseCase";
export default class UpDownCounterUseCase extends UseCase {
    execute() {
        return this.context
            .useCase(new IncrementalCounterUseCase())
            .execute()
            .then(() => {
                return this.context.useCase(new DecrementalCounterUseCase()).execute();
            });
    }
}
