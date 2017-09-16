// MIT © 2017 azu
"use strict";
require("babel-polyfill");
const assert = require("assert");
const bench = require("../src/index");

const AlminVersions = {
    "0.9": require("../almin-0.9"),
    current: require("../almin-current")
};
describe("benchmark", function() {
    const orginalEnv = process.env.NODE_ENV;
    beforeEach(() => {
        process.env.NODE_ENV = "production";
    });
    afterEach(() => {
        process.env.NODE_ENV = orginalEnv;
    });

    it("Current version should be fastest", function(done) {
        this.timeout(50 * 1000);
        bench(AlminVersions, benchmark => {
            const fastest = benchmark.filter("fastest").map("name");
            console.log(benchmark.join("\n"));
            if (Array.isArray(fastest)) {
                assert.equal(fastest[0], "current");
            } else {
                assert.equal(fastest, "current");
            }
            done();
        });
    });
});
