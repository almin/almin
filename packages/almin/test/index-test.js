// MIT © 2017 azu
"use strict";
const assert = require("assert");
import { Context } from "../src/index";

describe("index", () => {
    it("should export as named import", () => {
        assert.ok(Context !== undefined);
    });
    it("could required + get property", () => {
        const Store = require("../src/index").Store;
        assert.ok(Store !== undefined);
    });
    it("could required with destructuring", () => {
        const { Store } = require("../src/index");
        assert.ok(Store !== undefined);
    });
});
