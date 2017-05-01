// LICENSE : MIT
"use strict";
const assert = require("assert");
import AlminLogger from "../src/AlminLogger";
describe("AlminLogger-test", function() {
    it("use async by default", function() {
        const logger = new AlminLogger();
        assert.ok(logger.isAsyncMode);
    });
});