// LICENSE : MIT
"use strict";
import {UseCase} from "almin";
export default class DispatchUseCase extends UseCase {
    execute(payload) {
        this.dispatch(payload);
    }
}