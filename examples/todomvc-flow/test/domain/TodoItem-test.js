// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import TodoItem from "../../src/domain/TodoList/TodoItem";
describe("TodoItem-test", function() {
    it("could serialize", function() {
        const item = new TodoItem({
            title: "test"
        });
        const stringify = JSON.stringify(item);
        assert(stringify.includes("title"));
    });
});
