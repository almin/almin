"use strict";
const bench = require("./src/index");
const AlminVersions = require("./versions.js").AlminVersions;
bench(AlminVersions, benchmark => {
    console.log(benchmark.join("\n"));
    console.log("Fastest is " + benchmark.filter("fastest").map("name"));
});
