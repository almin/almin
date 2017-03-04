// MIT © 2017 azu
"use strict";
/**
 * @param {AlminVersions} Almin
 * @param {function(error, data)} done
 */
module.exports = function(Almin, done) {
    const {Context, Dispatcher, Store, StoreGroup, UseCase} = Almin;
    let viewState = null;
    const updateView = (state) => {
        viewState = state;
    }
    // store
    class MyStore extends Store {
        constructor() {
            super();
            this.state = {
                payload: null
            };
            this.onDispatch((payload) => {
                this.state.payload = payload;
                this.emitChange();
            });
        }

        getState() {
            return {
                "MyState": this.state
            };
        }
    }
    const store = new MyStore();
    const storeGroup = new StoreGroup([store]);
    // use-case
    class ChildUseCase extends UseCase {
        execute() {
            this.dispatch({
                type: "ChildUseCase"
            });
        }
    }
    class ParentUseCase extends UseCase {
        execute() {
            return this.context.useCase(new ChildUseCase()).execute();
        }
    }
    const dispatcher = new Dispatcher();
    const context = new Context({
        dispatcher,
        store: storeGroup
    });
    const log = () => {
        // nope
    }
    context.onDispatch(log);
    context.onWillExecuteEachUseCase(log);
    context.onDidExecuteEachUseCase(log);
    context.onCompleteEachUseCase(log);
    context.onErrorDispatch(log);
    context.useCase(new ParentUseCase()).execute().then(() => {
        const state = storeGroup.getState();
        updateView(state);
        done();
    }).catch(error => {
        done(error);
    });
};
