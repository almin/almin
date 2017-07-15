// MIT © 2017 azu
"use strict";
import { UseCase, Store } from "../../src/index";
import { shallowEqual } from "shallow-equal-object";

export function createUpdatableStoreWithUseCase(name) {
    let sharedState = {};

    /**
     * request state updating function.
     * The change will be apply on Store#receivePayload
     * @param {*} newState
     */
    const requestUpdateState = newState => {
        sharedState = newState;
    };

    /**
     * This UseCase can update Store via Store#receivePayload
     */
    class MockUseCase extends UseCase {
        constructor() {
            super();
            this.name = `${name}UseCase`;
        }

        /**
         * Update State
         * @param {*} newState
         */
        requestUpdateState(newState) {
            requestUpdateState(newState);
        }
    }

    class MockStore extends Store {
        constructor() {
            super();
            this.name = `${name}Store`;
            this.state = {};
        }

        receivePayload(payload) {
            if (!shallowEqual(this.state, sharedState)) {
                this.setState(sharedState);
            }
        }

        getState() {
            return this.state;
        }
    }

    return {
        MockUseCase,
        MockStore,
        requestUpdateState
    };
}
