import React from "react";
import ReactDOM from "react-dom";
import AlminReactContainer from "almin-react-container";
import AlminLogger from "almin-logger";
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
    return AppLocator.context.useCase(InitializeProductUseCase.create()).execute();
}).then(() => {
    // StoreGroup#getState to <App .{..state} />
    const Bootstrap = AlminReactContainer.create(App, AppLocator.context);
    // Initial render
    ReactDOM.render(
        <Bootstrap/>,
        document.getElementById("flux-app")
    );
});
