"use strict";
const bench = require("./src/index");
const AlminVersions = {
    "current": require("./almin-current"),
    "0.12": require("./almin-0.12"),
    "0.9": require("./almin-0.9"),
};
bench(AlminVersions, (benchmark) => {
    console.log(benchmark.join("\n"));
    console.log('Fastest is ' + benchmark.filter('fastest').map('name'));
});
