// MIT © 2017 azu
"use strict";
const { Dispatcher, Context, Store, StoreGroup, UseCase } = require("almin-0.12");

module.exports = {
    createContext(stores) {
        const storeMappings = stores.reduce((t, store) => {
            t[store.name] = store;
            return t;
        }, {});
        return new Context({
            dispatcher: new Dispatcher(),
            store: new StoreGroup(storeMappings)
        });
    },
    createUseCase() {
        class MyUseCase extends UseCase {
            execute(state) {
                this.dispatch({
                    type: "update",
                    body: state
                });
            }
        }
        return new MyUseCase();
    },
    createStore(name) {
        class TestStore extends Store {
            constructor() {
                super();
                this.name = name;
                this.state = null;
            }

            receivePayload(payload) {
                if (payload.type === "update") {
                    this.setState(payload.body);
                }
            }

            getState() {
                return this.state;
            }
        }
        return new TestStore();
    }
};
