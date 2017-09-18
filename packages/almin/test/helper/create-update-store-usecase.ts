// MIT © 2017 azu
"use strict";
import { UseCase, Store } from "../../src/index";
import { shallowEqual } from "shallow-equal-object";
import { Payload } from "../../src/payload/Payload";

export function createUpdatableStoreWithUseCase(name: string) {
    let sharedState = {};

    /**
     * request state updating function.
     * The change will be apply on Store#receivePayload
     * @param {*} newState
     */
    const requestUpdateState = (newState: any) => {
        sharedState = newState;
    };

    /**
     * This UseCase can update Store via Store#receivePayload
     */
    abstract class MockUseCase extends UseCase {
        constructor() {
            super();
            this.name = `${name}UseCase`;
        }

        /**
         * Update State
         * @param {*} newState
         */
        requestUpdateState(newState: any) {
            requestUpdateState(newState);
        }
    }

    class MockStore extends Store {
        constructor() {
            super();
            this.name = `${name}Store`;
            this.state = {};
        }

        receivePayload(_payload: Payload) {
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
