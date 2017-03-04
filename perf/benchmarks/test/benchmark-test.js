// MIT © 2017 azu
"use strict";
require("babel-polyfill");
const assert = require("assert");
const task = require("../src/task");
const _ = require('lodash');
const process = require('process');
let Benchmark = require('benchmark');
Benchmark = Benchmark.runInContext({_: _, process: process});
const Suite = Benchmark.Suite;
// workaround for browser
// https://github.com/bestiejs/benchmark.js/issues/128
if (typeof window == 'object') {
    window.Benchmark = Benchmark;
    window.Suite = Suite;
}
const AlminVersions = {
    "0.9": require("almin-0.9"),
    "current": require("almin")
};
describe("benchmark", function() {
    it("Current version should be fastest", function(done) {
        this.timeout(50 * 1000);
        const suite = new Suite();
        Object.keys(AlminVersions).forEach(version => {
            suite.add(version, function(deferred) {
                task(AlminVersions[version], (error) => {
                    if (error) {
                        deferred.resolve(error);
                    } else {
                        deferred.resolve();
                    }
                });
            }, {'defer': true});
        });
        suite.on('complete', function() {
            const fastest = this.filter('fastest').map('name');
            console.log(this.join("\n"));
            if (Array.isArray(fastest)) {
                assert.equal(fastest[0], "current");
            } else {
                assert.equal(fastest, "current");
            }
            done();
        })
        .run({async: true});
    });
});
