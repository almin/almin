// LICENSE : MIT
"use strict";
const assert = require("assert");
import {
    CompletedPayload,
    Context,
    DidExecutedPayload,
    Dispatcher,
    ErrorPayload,
    Store,
    WillExecutedPayload
} from "almin";
import AlminLogger from "../src/AlminLogger";
import AsyncLogger from "../src/AsyncLogger";
import { LogGroup } from "../src/log/LogGroup";
import ConsoleMock from "./helper/ConsoleMock";
import { createStore } from "./store/create-store";
import DispatchUseCase from "./usecase/DispatchUseCase";
import ErrorUseCase from "./usecase/ErrorUseCase";
import { ParentUseCase } from "./usecase/NestingUseCase";
import NoDispatchUseCase from "./usecase/NoDispatchUseCase";
import { NotExecuteUseCase } from "./usecase/NotExecuteUseCase";
import WrapUseCase from "./usecase/WrapUseCase";

describe("AsyncLogger", function() {
    it("can start and stop", () => {
        const consoleMock = ConsoleMock.create();
        const logger = new AsyncLogger({
            console: consoleMock
        });
        const store = createStore();
        const context = new Context({
            store,
            dispatcher: new Dispatcher()
        });
        const results = [];
        logger.on(AlminLogger.Events.output, function(logGroup) {
            results.push(logGroup);
        });
        return context
            .useCase(new DispatchUseCase())
            .execute({ type: "1" })
            .then(() => {
                assert.strictEqual(results.length, 0, "not start yet");
            })
            .then(() => {
                logger.startLogging(context);
            })
            .then(() => {
                return context
                    .useCase(new DispatchUseCase())
                    .execute({ type: "1" })
                    .then(() => {
                        assert.strictEqual(results.length, 1, "start");
                    });
            })
            .then(() => {
                logger.stopLogging();
            })
            .then(() => {
                return context
                    .useCase(new DispatchUseCase())
                    .execute({ type: "1" })
                    .then(() => {
                        assert.strictEqual(results.length, 1, "same 1");
                    });
            })
            .then(() => {
                // restart again
                logger.startLogging(context);
            })
            .then(() => {
                return context
                    .useCase(new DispatchUseCase())
                    .execute({ type: "2" })
                    .then(() => {
                        assert.strictEqual(results.length, 2, "start again");
                    });
            });
    });
    describe("#addLog", () => {
        it("should add current LogGroups", () => {
            const consoleMock = ConsoleMock.create();
            const logger = new AsyncLogger({
                console: consoleMock
            });
            const dispatcher = new Dispatcher();
            const useCase = new WrapUseCase();
            const store = createStore();
            const context = new Context({
                store,
                dispatcher
            });
            logger.startLogging(context);
            const results = [];
            logger.on(AlminLogger.Events.output, function(logGroup) {
                results.push(logGroup);
            });

            const expectedLog = "test log";
            const addLog = () => {
                logger.addLog(expectedLog);
            };
            return context
                .useCase(useCase)
                .execute(addLog)
                .then(() => {
                    assert(results.length === 1);
                    const [logGroup] = results;
                    assert(logGroup.title === "WrapUseCase");
                    assert(logGroup.children.length === 4);
                    const [first, second, third, last] = logGroup.children;
                    assert(first.payload instanceof WillExecutedPayload);
                    assert(second.log === expectedLog);
                    assert(third.payload instanceof DidExecutedPayload);
                    assert(last.payload instanceof CompletedPayload);
                });
        });
    });
    it("when complete output log, emit logGroup", () => {
        const consoleMock = ConsoleMock.create();
        const logger = new AsyncLogger({
            console: consoleMock
        });
        const dispatcher = new Dispatcher();
        const useCase = new DispatchUseCase();
        const store = createStore();
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
        // Dispatch UseCase -> Error UseCase
        return context
            .useCase(useCase)
            .execute(dispatchedPayload)
            .then(() => {
                assert(results.length === 1);
                const logGroup = results.shift();
                assert(logGroup.title === "DispatchUseCase");
                assert(logGroup.children.length === 4);
                const [first, second, third, last] = logGroup.children;
                assert(first.payload instanceof WillExecutedPayload);
                assert.deepEqual(second.payload, dispatchedPayload);
                assert(third.payload instanceof DidExecutedPayload);
                assert(last.payload instanceof CompletedPayload);
            })
            .then(() => {
                const useCase = new ErrorUseCase();
                return context
                    .useCase(useCase)
                    .execute()
                    .catch(error => {
                        assert(results.length === 1);
                        const logGroup = results.shift();
                        assert(logGroup.title === "ErrorUseCase");
                        assert(logGroup.children.length === 4);
                        const [first, second, third, last] = logGroup.children;
                        assert(first.payload instanceof WillExecutedPayload);
                        assert(second.payload instanceof DidExecutedPayload);
                        assert(third.payload instanceof ErrorPayload);
                        assert(last.payload instanceof CompletedPayload);
                    });
            });
    });
    context("when transaction", () => {
        it("should be nest of logGroup ", () => {
            const consoleMock = ConsoleMock.create();
            const logger = new AsyncLogger({
                console: consoleMock
            });
            const context = new Context({
                store: createStore(),
                dispatcher: new Dispatcher(),
                options: {
                    strict: true
                }
            });
            logger.startLogging(context);

            const results = [];
            logger.on(AlminLogger.Events.output, function(logGroup) {
                results.push(logGroup);
            });
            return context
                .transaction("transaction", transactionContext => {
                    return transactionContext
                        .useCase(new NoDispatchUseCase())
                        .execute()
                        .then(() => {
                            transactionContext.commit();
                        });
                })
                .then(() => {
                    assert(results.length === 1);
                    const [logGroup] = results;
                    assert(logGroup.title === "transaction");
                    assert(logGroup.children.length === 1);
                    const [noDispatchUseCaseLogGroup] = logGroup.children;
                    assert(noDispatchUseCaseLogGroup.children.length === 3);
                    const [will, did, complete] = noDispatchUseCaseLogGroup.children;
                    assert(will.payload instanceof WillExecutedPayload);
                    assert(did.payload instanceof DidExecutedPayload);
                    assert(complete.payload instanceof CompletedPayload);
                });
        });
        it("should create difference logGroup by transaction.id ", () => {
            const consoleMock = ConsoleMock.create();
            const logger = new AsyncLogger({
                console: consoleMock
            });
            const context = new Context({
                store: createStore(),
                dispatcher: new Dispatcher(),
                options: {
                    strict: true
                }
            });
            logger.startLogging(context);
            const results = [];
            logger.on(AlminLogger.Events.output, function(logGroup) {
                results.push(logGroup);
            });
            const getTransaction = () => {
                return context.transaction("transaction", transactionContext => {
                    return transactionContext
                        .useCase(new NoDispatchUseCase())
                        .execute()
                        .then(() => {
                            transactionContext.commit();
                        });
                });
            };
            const transactionA = getTransaction();
            const transactionB = getTransaction();
            return Promise.all([transactionA, transactionB]).then(() => {
                assert(results.length === 2);
            });
        });
    });
    context("when nest useCase", () => {
        it("should nest of logGroup ", () => {
            const consoleMock = ConsoleMock.create();
            const logger = new AsyncLogger({
                console: consoleMock
            });
            const context = new Context({
                store: createStore(),
                dispatcher: new Dispatcher()
            });
            logger.startLogging(context);

            const results = [];
            logger.on(AlminLogger.Events.output, function(logGroup) {
                results.push(logGroup);
            });
            const useCase = new ParentUseCase();
            return context
                .useCase(useCase)
                .execute()
                .then(() => {
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

    it("should log willNotExecute event", function() {
        const consoleMock = ConsoleMock.create();
        const logger = new AsyncLogger({
            console: consoleMock
        });
        const dispatcher = new Dispatcher();
        const store = createStore();
        const context = new Context({
            store,
            dispatcher
        });
        const useCase = new NotExecuteUseCase();
        logger.startLogging(context);
        // yet not called
        assert(!consoleMock.groupCollapsed.called);
        assert(!consoleMock.log.called);
        // Then
        let actualLogGroup = null;
        logger.on(AlminLogger.Events.output, function(logGroup) {
            actualLogGroup = logGroup;
        });
        // When
        return context
            .useCase(useCase)
            .execute()
            .then(() => {
                assert(consoleMock.groupCollapsed.called);
                const expectOutput = `NotExecuteUseCase`;
                const isContain = consoleMock.log.calls.some(call => {
                    return call.arg && call.arg.indexOf(expectOutput) !== -1;
                });
                assert.ok(isContain, `${expectOutput} is not found.`);
            });
    });
    it("should log dispatch event", function() {
        const consoleMock = ConsoleMock.create();
        const logger = new AsyncLogger({
            console: consoleMock
        });
        const dispatcher = new Dispatcher();
        const store = createStore();
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
        let actualLogGroup = null;
        logger.on(AlminLogger.Events.output, function(logGroup) {
            actualLogGroup = logGroup;
        });
        // When
        return context
            .useCase(useCase)
            .execute({
                type: "example"
            })
            .then(() => {
                assert(consoleMock.groupCollapsed.called);
                const expectOutput = `dispatch:example`;
                const isContain = consoleMock.log.calls.some(call => {
                    return call.arg && call.arg.indexOf(expectOutput) !== -1;
                });
                assert(isContain, `${expectOutput} is not found.`);
            });
    });
    it("should output as async", function(done) {
        const consoleMock = ConsoleMock.create();
        const logger = new AsyncLogger({
            console: consoleMock
        });
        const store = createStore();
        const dispatcher = new Dispatcher();
        const useCase = new NoDispatchUseCase();
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
        const store = createStore();
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
            const expectOutput = `dispatch:`;
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
});
