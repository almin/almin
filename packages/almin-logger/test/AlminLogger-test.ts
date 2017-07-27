import * as assert from "assert";
import { AlminLogger, default as DefaultLogger } from "./../src/AlminLogger";
describe("export", () => {
    it("default should be AlminLogger", () => {
        assert.strictEqual(DefaultLogger, AlminLogger);
    });
    it("export { AlminLogger }", () => {
        assert.strictEqual(typeof AlminLogger, "function");
    });
});
