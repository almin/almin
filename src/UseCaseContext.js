// LICENSE : MIT
"use strict";
/*
    This class aim to execute other UseCase in the UseCase
 */
import UseCaseExecutor from "./UseCaseExecutor";
import Dispatcher from "./Dispatcher";
const assert = require("assert");
export default class UseCaseContext {
    /**
     * @param {Dispatcher|UseCase} dispatcher
     */
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }

    /**
     * Create UseCaseExecutor for {@link useCase}.
     * @param {UseCase} useCase
     * @returns {UseCaseExecutor}
     */
    useCase(useCase) {
        assert(useCase !== this.dispatcher, `the useCase(${useCase}) should not equal this useCase(${this.dispatcher})`);
        return new UseCaseExecutor(useCase, this.dispatcher);
    }
}