// LICENSE : MIT
"use strict";
import { UseCase } from "../../src/UseCase";
// Parent -> ChildUseCase
export class ParentUseCase extends UseCase {
    constructor() {
        super();
        this.childUseCase = new ChildUseCase();
    }

    execute() {
        return this.context.useCase(this.childUseCase).execute();
    }
}
export class ChildUseCase extends UseCase {
    execute() {
        this.dispatch({
            type: "ChildUseCase"
        });
    }
}
