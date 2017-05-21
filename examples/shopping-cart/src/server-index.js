import * as path from "path";
import React from "react";
import AlminReactContainer from "almin-react-container";
import { HTML } from "./server/HTML";
import App from "./components/App";
import AppLocator from "./AppLocator";
// store
import AppStore from "./stores/AppStore";
// UseCase
import InitializeCustomerUseCase from "./usecase/Initial/InitializeCustomerUseCase";
import InitializeProductUseCase from "./usecase/Initial/InitializeProductUseCase";
// context
import { Context, Dispatcher } from "almin";
import AlminLogger from "almin-logger";

const express = require("express");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser");
const ReactDOMServer = require("react-dom/server");

app.use(bodyParser.json());
// /public is static files
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// load initial products data
const loadInitialState = () => {
    return Promise.resolve(require("./api/products.json"));
};

// /server is server-side rendering
app.get("/server", (req, res) => {
    loadInitialState().then(products => {
        // instances
        const dispatcher = new Dispatcher();
        // context connect dispatch with stores
        const appContext = new Context({
            dispatcher,
            store: AppStore.create()
        });
        // Initialize application domain
        appContext.useCase(InitializeCustomerUseCase.create()).execute().then(() => {
            return appContext.useCase(InitializeProductUseCase.create()).execute();
        }).then(() => {
            // StoreGroup#getState to <App .{..state} />
            const Bootstrap = AlminReactContainer.create(App, appContext);
            const html = HTML({
                html: ReactDOMServer.renderToString(<Bootstrap/>),
                initialState: products
            });
            res.status(200).send(html);
            appContext.release();
        });
    });
});


const port = process.env.PORT || 3000;
// start server
app.listen(port, function() {
    console.log(`listening on port http://localhost:${port}/server`);
});
