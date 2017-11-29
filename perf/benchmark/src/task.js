// MIT © 2017 azu
"use strict";
/**
 * @param {AlminVersions} Almin
 * @param {function(error, data)} done
 */
module.exports = function(Almin, done) {
    const { createContext, createStore, createUseCase } = Almin;
    let viewState = null;
    const updateView = state => {
        viewState = state;
    };
    // use-case
    const stores = Array.from(new Array(500), (_, i) => i).map(index => {
        return createStore(`Store${index}`);
    });
    const context = createContext(stores);
    const log = () => {
        // nope
    };
    context.events.onDispatch(log);
    context.events.onWillExecuteEachUseCase(log);
    context.events.onDidExecuteEachUseCase(log);
    context.events.onCompleteEachUseCase(log);
    context.events.onErrorDispatch(log);
    context.onChange(() => {
        const state = context.getState();
        log(state);
    });
    const useCase = createUseCase();
    context
        .useCase(useCase)
        .execute({ newState: { a: 1 } })
        .then(() => {
            done();
        });
};
