// LICENSE : MIT
"use strict";
const assert = require("assert");
import {Context, Store, UseCase, Dispatcher} from "almin";
import AlminLogger from "../src/AlminLogger";
import ConsoleMock from "./helper/ConsoleMock";
class ExampleUseCase extends UseCase {
    execute() {

    }
}
describe("AlminLogger-test", function () {
    it("should output as async", function (done) {
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
        logger.on(AlminLogger.Events.output, function () {
            assert(consoleMock.groupCollapsed.called);
            assert(consoleMock.log.called);
            done();
        });
        // When
        context.useCase(useCase).execute();
    });
});