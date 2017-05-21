import React from "react";
import ReactDOM from "react-dom";
import AlminLogger from "almin-logger";
import AlminReactContainer from "almin-react-container";
import App from "./components/App";
import AppLocator from "./AppLocator";
// store
import AppStore from "./stores/AppStore";
// UseCase
import InitializeCustomerUseCase from "./usecase/Initial/InitializeCustomerUseCase";
import InitializeProductUseCase from "./usecase/Initial/InitializeProductUseCase";
// context
import { Context, Dispatcher } from "almin";
// instances
const dispatcher = new Dispatcher();
// context connect dispatch with stores
const appContext = new Context({
    dispatcher,
    store: AppStore.create()
});
if (process.env.NODE_ENV !== "production") {
    // start logger
    const logger = new AlminLogger();
    logger.startLogging(appContext);
    AppLocator.alminLogger = logger;
}
// set global context
AppLocator.context = appContext;
// Initialize application domain
AppLocator.context.useCase(InitializeCustomerUseCase.create()).execute()
.then(() => {
    // use initialState if server-side provide
    // if initialState is not provided, client fetch products data
    const initialShopProducts = window.__PRELOADED_STATE__ ? window.__PRELOADED_STATE__ : undefined;
    return AppLocator.context.useCase(InitializeProductUseCase.create()).execute(initialShopProducts);
}).then(() => {
    // StoreGroup#getState to <App .{..state} />
    const Bootstrap = AlminReactContainer.create(App, AppLocator.context);
    // Initial render
    ReactDOM.render(
        <Bootstrap />,
        document.getElementById("flux-app")
    );
});
