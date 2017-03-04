"use strict";
const bench = require("./src/index");
const AlminVersions = {
    "0.9": require("almin-0.9"),
    "current": require("almin")
};
bench(AlminVersions, (benchmark) => {
    console.log(benchmark.join("\n"));
});
