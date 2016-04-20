const usePluginList = [
    "postcss-easy-import",
    "postcss-custom-properties",
    "postcss-calc",
    "postcss-custom-media",
    "autoprefixer",
    "postcss-reporter"
];
module.exports = {
    "root": "./src/",
    "use": usePluginList,
    "input": "./src/index.css",
    "output": "./public/build/bundle.css",
    "local-plugins": true,
    "postcss-easy-import": {
        root: "./src/",
        glob: true,
        onImport: function (sources) {
            global.watchCSS(sources, this.from);
        }
    },
    "autoprefixer": {
        "browsers": "> 5%"
    }
};