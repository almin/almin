// LICENSE : MIT
"use strict";
const assert = require("assert");
import {Context, Store, Dispatcher} from "almin";
import AlminLogger from "../src/AlminLogger";
import AsyncLogger from "../src/AsyncLogger";
import SyncLogger from "../src/SyncLogger";
import ConsoleMock from "./helper/ConsoleMock";
import ExampleUseCase from "./usecase/ExampleUseCase"
describe("AlminLogger-test", function () {
    context("async options", function () {
        it("use async logger by default", function () {
            const logger = new AlminLogger();
            assert(logger.logger instanceof AsyncLogger);
        });
        it("when set async:false, use SyncLogger", function () {
            const logger = new AlminLogger({
                async: false
            });
            assert(logger.logger instanceof SyncLogger);
        });
    });

    it("should log useCase", function (done) {
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
        logger.on(AlminLogger.Events.output, function () {
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
});