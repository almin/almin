const browserList = "> 5%";
module.exports = ctx => {
    return {
        plugins: {
            "postcss-easy-import": {},
            "postcss-custom-properties": {},
            "postcss-calc": {},
            "postcss-custom-media": {},
            autoprefixer: {
                browsers: browserList
            }
        }
    };
};
