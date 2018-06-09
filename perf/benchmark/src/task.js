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
    const stores = Array.from(new Array(50), (_, i) => i).map(index => {
        return createStore(`Store${index}`);
    });
    const context = createContext(stores);
    const log = () => {
        // nope
    };
    (context.events || context).onDispatch(log);
    (context.events || context).onWillExecuteEachUseCase(log);
    (context.events || context).onDidExecuteEachUseCase(log);
    (context.events || context).onCompleteEachUseCase(log);
    (context.events || context).onErrorDispatch(log);
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
