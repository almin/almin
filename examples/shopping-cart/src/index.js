import React from "react";
import ReactDOM from "react-dom";
import { AlminLogger } from "almin-logger";
import AlminReactContainer from "almin-react-container";
import App from "./components/App";
import AppLocator from "./AppLocator";
// store
import AppStore from "./stores/AppStore";
// UseCase
import InitializeRepositoryUseCase from "./usecase/Initial/InitializeRepositoryUseCase";
import InitializeCustomerUseCase from "./usecase/Initial/InitializeCustomerUseCase";
import InitializeProductUseCase from "./usecase/Initial/InitializeProductUseCase";
// context
import { Context, Dispatcher } from "almin";
// instances
const dispatcher = new Dispatcher();
// context connect dispatch with stores
const appContext = new Context({
    dispatcher,
    store: AppStore.create(),
    options: {
        strict: true,
        performanceProfile: process.env.NODE_ENV !== "production"
    }
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
(async function bootApp() {
    await appContext.transaction("bootstrap", async transactionContext => {
        // reset repository and observe changes
        await transactionContext.useCase(InitializeRepositoryUseCase.create()).execute();
        // Create anonymous customer data
        await transactionContext.useCase(InitializeCustomerUseCase.create()).execute();
        // use initialState if server-side provide
        // if initialState is not provided, client fetch products data
        const initialShopProducts = window.__PRELOADED_STATE__ ? window.__PRELOADED_STATE__ : undefined;
        await transactionContext.useCase(InitializeProductUseCase.create()).execute(initialShopProducts);
        // commit
        transactionContext.commit();
    });
    // Render <Bootstrap>
    const Bootstrap = AlminReactContainer.create(App, AppLocator.context);
    // Initial render
    ReactDOM.render(<Bootstrap />, document.getElementById("flux-app"));
})();
