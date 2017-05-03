const path = require("path");

module.exports = {
    entry: "./index.js",
    devtool: process.env.WEBPACK_DEVTOOL || "source-map",
    output: {
        path: path.join(__dirname, "build"),
        filename: "bundle.js"
    }
};
