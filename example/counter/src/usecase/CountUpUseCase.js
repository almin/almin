// LICENSE : MIT
"use strict";
import {UseCase} from "almin"
export default class CountUpUseCase extends UseCase {
    // CountUpUseCase emit event ----> Store
    // UseCase should implement #execute method
    execute(count) {
        this.dispatch({
            type: CountUpUseCase.name,
            count
        })
    }
}