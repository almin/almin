"use strict";
const bench = require("./src/index");
const AlminVersions = {
    current: require("./almin-current"),
    "0.14": require("./almin-0.14"),
    "0.13": require("./almin-0.13")
};
bench(AlminVersions, benchmark => {
    console.log(benchmark.join("\n"));
    console.log("Fastest is " + benchmark.filter("fastest").map("name"));
});
