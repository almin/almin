// LICENSE : MIT
"use strict";
import { UseCase } from "../../src";
// Parent -> ChildUseCase
export class ParentUseCase extends UseCase {
    public childUseCase: ChildUseCase;
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
