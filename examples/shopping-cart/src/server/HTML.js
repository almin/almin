// MIT © 2017 azu
"use strict";
const React = require("react");
const serialize = require("serialize-javascript");
export const HTML = props => `
<!DOCTYPE html>
<html>
<head>
    <meta charSet="utf-8"/>
    <title>shopping cart example</title>
    <link rel="shortcut icon" type="image/png" href="assets/react.png"/>
    <link rel="stylesheet" href="css/uikit.almost-flat.min.css"/>
    <link rel="stylesheet" href="css/main.css"/>
</head>
<body>
<div id="flux-app">${props.html}</div>
<script>
      // See http://redux.js.org/docs/recipes/ServerRendering.html#security-considerations
      window.__PRELOADED_STATE__ = ${serialize(props.initialState)}
</script>
<script src="/build/bundle.js"></script>
</body>
</html>
`;
