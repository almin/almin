// LICENSE : MIT
"use strict";

import UseCaseExecutor from "./UseCaseExecutor";
import Dispatcher from "./Dispatcher";
const assert = require("assert");
/**
 * UseCase internally use UseCaseContext insteadof Context.
 * It has limitation as against to Context.
 * Because, UseCaseContext is for UseCase.
 * @public
 */
export default class UseCaseContext {
    /**
     * @param {Dispatcher|UseCase} dispatcher dispatcher is Dispatcher or parent UseCase.
     * @public
     */
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }

    /**
     * Create UseCaseExecutor for `useCase`.
     * @param {UseCase} useCase
     * @returns {UseCaseExecutor}
     * @private
     */
    useCase(useCase) {
        if (process.env.NODE_ENV !== "production") {
            assert(useCase !== this.dispatcher, `the useCase(${useCase}) should not equal this useCase(${this.dispatcher})`);
        }
        return new UseCaseExecutor({
            useCase,
            parent: this.dispatcher,
            dispatcher: this.dispatcher
        });
    }
}