const path = require("path");

module.exports = {
    entry: "./test/benchmark-test.js",
    devtool: "source-map",
    output: {
        path: path.join(__dirname, "build"),
        publicPath: "/build/",
        filename: "test-bundle.js"
    },
    module: {
        noParse: [
            // Suppress warnings and errors logged by benchmark.js when bundled using webpack.
            // https://github.com/bestiejs/benchmark.js/issues/106
            new RegExp(path.resolve(__dirname, './node_modules/benchmark/benchmark.js'))
        ],
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    cacheDirectory: true
                }
            }
        ]
    }
};
