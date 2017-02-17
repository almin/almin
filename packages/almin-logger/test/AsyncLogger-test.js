// LICENSE : MIT
"use strict";
const assert = require("assert");
import {
    Context,
    Store,
    Dispatcher,
    CompletedPayload,
    DidExecutedPayload,
    ErrorPayload,
    WillExecutedPayload
} from "almin";
import AsyncLogger from "../src/AsyncLogger";
import LogGroup from "../src/log/LogGroup";
import AlminLogger from "../src/AlminLogger";
import ConsoleMock from "./helper/ConsoleMock";
import ExampleUseCase from "./usecase/ExampleUseCase";
import ErrorUseCase from "./usecase/ErrorUseCase";
import DispatchUseCase from "./usecase/DispatchUseCase";
import {ParentUseCase, ChildUseCase} from "./usecase/NestingUseCase";
describe("AsyncLogger", function() {
    it("when complete output log, emit logGroup", () => {
        const consoleMock = ConsoleMock.create();
        const logger = new AsyncLogger({
            console: consoleMock
        });
        const dispatcher = new Dispatcher();
        const useCase = new DispatchUseCase();
        const store = new Store();
        const context = new Context({
            store,
            dispatcher
        });
        logger.startLogging(context);
        const results = [];
        logger.on(AlminLogger.Events.output, function(logGroup) {
            results.push(logGroup);
        });
        const dispatchedPayload = {
            type: "test"
        };
        return context.useCase(useCase).execute(dispatchedPayload).then(() => {
            assert(results.length === 1);
            const [logGroup] = results;
            assert(logGroup.title === "DispatchUseCase");
            assert(logGroup.children.length === 4);
            const [first, second, third, last] = logGroup.children;
            assert(first.payload instanceof WillExecutedPayload);
            assert.deepEqual(second.payload, dispatchedPayload);
            assert(third.payload instanceof DidExecutedPayload);
            assert(last.payload instanceof CompletedPayload);
        });
    });
    context("when nest useCase", () => {
        it("should nest of logGroup ", () => {
            const consoleMock = ConsoleMock.create();
            const logger = new AsyncLogger({
                console: consoleMock
            });
            const context = new Context({
                store: new Store(),
                dispatcher: new Dispatcher()
            });
            logger.startLogging(context);

            const results = [];
            logger.on(AlminLogger.Events.output, function(logGroup) {
                results.push(logGroup);
            });
            const useCase = new ParentUseCase();
            return context.useCase(useCase).execute().then(() => {
                assert(results.length === 1);
                const [logGroup] = results;
                assert(logGroup.title === "ParentUseCase");
                assert(logGroup.children.length === 4);
                const [first, childLogGroup, third, last] = logGroup.children;
                assert(first.payload instanceof WillExecutedPayload);
                assert(third.payload instanceof DidExecutedPayload);
                assert(last.payload instanceof CompletedPayload);
                // child
                assert(childLogGroup instanceof LogGroup);
                assert(childLogGroup.title === "ChildUseCase <- ParentUseCase");
                assert(Array.isArray(childLogGroup.children));
                assert(childLogGroup.children.length === 3);
                const [childFirst, childSecond, childThird] = childLogGroup.children;
                assert(childFirst.payload instanceof WillExecutedPayload);
                assert(childSecond.payload instanceof DidExecutedPayload);
                assert(childThird.payload instanceof CompletedPayload);
            });
        });
    });
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
        const store = new Store();
        const dispatcher = new Dispatcher();
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
    it("should have output buffer", function() {
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
        logger.startLogging(context);
        // yet not called
        assert(!consoleMock.groupCollapsed.called);
        assert(!consoleMock.error.called);
        // Then
        return context.useCase(errorUseCase).execute().catch(() => {
            assert(consoleMock.groupCollapsed.called);
            assert(consoleMock.error.called);
            // will
            // UseCase log
            // did
            // throw
            // complete
            // taken time
        });
    });
});