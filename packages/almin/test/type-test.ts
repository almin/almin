import * as assert from "assert";
import * as path from "path";
import { check } from "typings-tester";

describe("typings", () => {
    it("pass", () => {
        assert.doesNotThrow(() => check([path.join(__dirname, "typescript/almin.ts")], "tsconfig.json"));
    });
    it("fail", () => {});
});
