const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: [
        "./src/index.js"
    ],
    devtool: process.env.WEBPACK_DEVTOOL || "source-map",
    output: {
        path: path.join(__dirname, "public", "build"),
        publicPath: "/build/",
        filename: "bundle.js"
    },
    module: {
        loaders: [
            {test: /\.json$/, loader: "json"},
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel",
                query: {
                    cacheDirectory: true
                }
            }
        ],
        // Allow expression as dependency to suppress warnings
        // http://webpack.github.io/docs/configuration.html#automatically-created-contexts-defaults-module-xxxcontextxxx
        exprContextCritical: false
    }
};
