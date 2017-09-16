"use strict";
import { UseCase } from "almin";
export default class AsyncUseCase extends UseCase {
    execute() {
        this.dispatch({ type: "start" });
        return Promise.resolve().then(() => {
            // does async function
        });
    }
}
