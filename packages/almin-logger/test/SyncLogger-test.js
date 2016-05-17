// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import {Context, Store, Dispatcher} from "almin";
import SyncLogger from "../src/SyncLogger";
import AlminLogger from "../src/AlminLogger";
import ConsoleMock from "./helper/ConsoleMock";
import ExampleUseCase from "./usecase/ExampleUseCase";
describe("SyncLogger", function () {
    it("should output", function (done) {
        const consoleMock = ConsoleMock.create();
        const logger = new SyncLogger({
            console: consoleMock
        });
        const dispatcher = new Dispatcher();
        const store = new Store();
        const context = new Context({
            store,
            dispatcher
        });
        const useCase = new ExampleUseCase();
        logger.startLogging(context);
        // yet not called
        assert(!consoleMock.groupCollapsed.called);
        assert(!consoleMock.log.called);
        // Then
        logger.on(AlminLogger.Events.output, () => {
            assert(consoleMock.groupCollapsed.called);
            assert(consoleMock.log.called);
            done();
        });
        // When
        context.useCase(useCase).execute({
            type: "example"
        });
    });
});