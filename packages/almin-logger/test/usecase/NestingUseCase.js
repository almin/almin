// LICENSE : MIT
"use strict";
import { UseCase } from "almin";
// Parent -> ChildUseCase
export class ParentUseCase extends UseCase {
    constructor() {
        super();
        this.name = "ParentUseCase";
    }

    execute() {
        return this.context.useCase(new ChildUseCase()).execute();
    }
}
export class ChildUseCase extends UseCase {
    constructor() {
        super();
        this.name = "ChildUseCase";
    }

    execute() {}
}
