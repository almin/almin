// LICENSE : MIT
"use strict";

import { UseCase } from "./UseCase";
import { UseCaseExecutor } from "./UseCaseExecutor";
import { Dispatcher } from "./Dispatcher";

const assert = require("assert");
/**
 * UseCase internally use UseCaseContext insteadof Context.
 * It has limitation as against to Context.
 * Because, UseCaseContext is for UseCase.
 * @public
 */
export class UseCaseContext {

    dispatcher: UseCase | Dispatcher;

    /**
     * @param   dispatcher
     *  The parent UseCase.
     */
    constructor(dispatcher: UseCase | Dispatcher) {
        this.dispatcher = dispatcher;
    }

    /**
     * Create UseCaseExecutor for `useCase`.
     * @param   useCase
     */
    useCase(useCase: UseCase): UseCaseExecutor {
        if (process.env.NODE_ENV !== "production") {
            assert(useCase !== this.dispatcher, `the useCase(${useCase}) should not equal this useCase(${this.dispatcher})`);
        }
        return new UseCaseExecutor({
            useCase,
            parent: UseCase.isUseCase(this.dispatcher) ? this.dispatcher : null,
            dispatcher: this.dispatcher
        });
    }
}
