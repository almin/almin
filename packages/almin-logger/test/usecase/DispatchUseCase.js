// LICENSE : MIT
"use strict";
import { UseCase } from "almin";
export default class DispatchUseCase extends UseCase {
    constructor() {
        super();
        this.name = "DispatchUseCase";
    }

    execute(payload) {
        this.dispatch(payload);
    }
}
