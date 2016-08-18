// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import {Context, Store, Dispatcher} from "almin";
import AsyncLogger from "../src/AsyncLogger";
import AlminLogger from "../src/AlminLogger";
import ConsoleMock from "./helper/ConsoleMock";
import ExampleUseCase from "./usecase/ExampleUseCase";
import ErrorUseCase from "./usecase/ErrorUseCase";
import DispatchUseCase from "./usecase/DispatchUseCase";
describe("AsyncLogger", function() {

    it("should log useCase", function(done) {
        const consoleMock = ConsoleMock.create();
        const logger = new AsyncLogger({
            console: consoleMock
        });
        const dispatcher = new Dispatcher();
        const useCase = new ExampleUseCase();
        const store = new Store();
        const context = new Context({
            store,
            dispatcher
        });
        logger.startLogging(context);
        // yet not called
        assert(!consoleMock.groupCollapsed.called);
        assert(!consoleMock.log.called);
        // Then
        logger.on(AlminLogger.Events.output, function() {
            assert(consoleMock.groupCollapsed.called);
            assert(consoleMock.log.called);
            done();
        });
        // When
        dispatcher.dispatch({
            type: "Test"
        });
        context.useCase(useCase).execute();
    });
    it("should log dispatch event", function(done) {
        const consoleMock = ConsoleMock.create();
        const logger = new AsyncLogger({
            console: consoleMock
        });
        const dispatcher = new Dispatcher();
        const store = new Store();
        const context = new Context({
            store,
            dispatcher
        });
        const useCase = new DispatchUseCase();
        logger.startLogging(context);
        // yet not called
        assert(!consoleMock.groupCollapsed.called);
        assert(!consoleMock.log.called);
        // Then
        logger.on(AlminLogger.Events.output, function() {
            assert(consoleMock.groupCollapsed.called);
            const expectOutput = `Dispatch:example`;
            const isContain = consoleMock.log.calls.some(call => {
                return call.arg && call.arg.indexOf(expectOutput) !== -1;
            });
            assert(isContain, `${expectOutput} is not found.`);
            done();
        });
        // When
        context.useCase(useCase).execute({
            type: "example"
        });
    });
    it("should output as async", function(done) {
        const consoleMock = ConsoleMock.create();
        const logger = new AsyncLogger({
            console: consoleMock
        });
        const dispatcher = new Dispatcher();
        const store = new Store();
        const useCase = new ExampleUseCase();
        const context = new Context({
            store,
            dispatcher
        });
        logger.startLogging(context);
        // yet not called
        assert(!consoleMock.groupCollapsed.called);
        assert(!consoleMock.log.called);
        // Then
        logger.on(AlminLogger.Events.output, function() {
            assert(consoleMock.groupCollapsed.called);
            assert(consoleMock.log.called);
            done();
        });
        // When
        context.useCase(useCase).execute();
    });
    it("should have output buffer", function(done) {
        const consoleMock = ConsoleMock.create();
        const logger = new AsyncLogger({
            console: consoleMock
        });
        const dispatcher = new Dispatcher();
        const store = new Store();
        const errorUseCase = new ErrorUseCase();
        const context = new Context({
            store,
            dispatcher
        });
        const logBuffer = [];
        logger.addLog = (log) => {
            logBuffer.push(log);
        };
        logger.startLogging(context);
        // yet not called
        assert(!consoleMock.groupCollapsed.called);
        assert(!consoleMock.error.called);
        // Then
        logger.on(AlminLogger.Events.output, function() {
            assert(consoleMock.groupCollapsed.called);
            assert(consoleMock.error.called);
            // will
            // UseCase log
            // did
            // throw
            // complete
            // taken time
            assert.equal(logBuffer.length, 6);
            done();
        });
        // When
        context.useCase(errorUseCase).execute();
    });
});