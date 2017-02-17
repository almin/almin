// LICENSE : MIT
"use strict";
const assert = require("assert");
import {UseCase, Context, Store, Dispatcher} from "almin";
import AlminLogger from "../src/AlminLogger";
import ConsoleMock from "./helper/ConsoleMock";
class ExampleUseCase extends UseCase {
    execute() {

    }
}
class DispatchUseCase extends UseCase {
    execute(payload) {
        this.dispatch(payload);
    }
}
xdescribe("AlminLogger-test", function() {
    it("should log useCase", function(done) {
        const consoleMock = ConsoleMock.create();
        const logger = new AlminLogger({
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

    it("should log dispatch event with Symbol type", function(done) {
        if (typeof Symbol === "undefined") {
            // pass
            return;
        }
        const consoleMock = ConsoleMock.create();
        const logger = new AlminLogger({
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
            const expectOutput = `Dispatch:`;
            const isContain = consoleMock.log.calls.some(call => {
                return call.arg && call.arg.indexOf(expectOutput) !== -1;
            });
            assert(isContain, `${expectOutput} is not found.`);
            done();
        });
        // When
        const typeSymbol = Symbol("example");
        context.useCase(useCase).execute({
            type: typeSymbol
        });
    });
    it("should log dispatch event", function(done) {
        const consoleMock = ConsoleMock.create();
        const logger = new AlminLogger({
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
        const logger = new AlminLogger({
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
});