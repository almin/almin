const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: [
        "./src/index.js"
    ],
    devtool: process.env.WEBPACK_DEVTOOL || "eval",
    output: {
        path: path.join(__dirname, "public", "build"),
        filename: "bundle.js"
    },
    module: {
        loaders: [
            {test: /\.json$/, loader: "json"},
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel"// .babelrcを参照する
            }
        ]
    }
};
