// MIT © 2017 azu
"use strict";
const task = require("./task");
const process = require('process');
const _ = require('lodash');
let Benchmark = require('benchmark');
Benchmark = Benchmark.runInContext({_: _, process: process});
const Suite = Benchmark.Suite;
// workaround for browser
// https://github.com/bestiejs/benchmark.js/issues/128
if (typeof window == 'object') {
    window.Benchmark = Benchmark;
    window.Suite = Suite;
}
/**
 * @param {Object} AlminVeesions
 * @param {function(benchmark: Object}} done
 */
module.exports = function(AlminVersions, done) {
    const suite = new Suite();
    // randomize for equality
    _.shuffle(Object.keys(AlminVersions)).forEach(version => {
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
        done(this);
    })
    .run({async: true});
}
