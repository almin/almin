import * as assert from "assert";
import * as path from "path";
import { check } from "typings-tester";

const test = (fileName: string) => {
    it(`${fileName} should be passed`, () => {
        try {
            check([path.join(__dirname, `typing-fixtures/${fileName}`)], "tsconfig.json");
        } catch (error) {
            assert.fail(error.stack);
        }
    });
};
describe("typings", () => {
    test("almin.ts");
    test("almin-loading.ts");
    test("non-execute-arguments.ts");
    test("mismatch-execute-arguments.ts");
});
