// MIT © 2017 azu
"use strict";
const { Dispatcher, Context, Store, StoreGroup, UseCase } = require("almin-0.9");
module.exports = {
    createContext: function(stores) {

        return new Context({
            dispatcher: new Dispatcher(),
            store: new StoreGroup(stores)
        });
    },
    createUseCase(state){
        class MyUseCase extends UseCase {
            execute() {
                this.dispatch({
                    type: "update",
                    body: state
                });
            }
        }
        return new MyUseCase();
    },
    createStore(name){
        class TestStore extends Store {
            constructor() {
                super();
                this.name = name;
                this.state = null
                this.onDispatch((payload) => {
                    if (payload.type === "update") {
                        this.updateState(payload.body);
                    }
                });
            }

            updateState(newState) {
                if (this.state !== newState) {
                    this.state = newState;
                    this.emitChange();
                }
            }

            getState() {
                return {
                    [name]: this.state
                };
            }
        }
        return new TestStore();
    }
};
