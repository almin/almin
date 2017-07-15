const path = require("path");

const client = require("./webpack.config");
const server = {
    entry: "./src/server-index.js",
    devtool: process.env.WEBPACK_DEVTOOL || "source-map",
    output: {
        path: path.join(__dirname, "build"),
        filename: "server.js"
    },
    target: "node",
    node: {
        __filename: false,
        __dirname: false
    },
    module: {
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
module.exports = [client, server];
