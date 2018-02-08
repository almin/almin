// MIT © 2017 azu
"use strict";
import { Payload, Store, UseCase } from "../../src";
import { shallowEqual } from "shallow-equal-object";

export function createUpdatableStoreWithUseCase(name: string) {
    let isSharedStateChanged = false;
    let sharedState = {};

    /**
     * request state updating function.
     * The change will be apply on Store#receivePayload
     * @param {*} newState
     */
    const requestUpdateState = (newState: any) => {
        sharedState = newState;
        isSharedStateChanged = true;
    };

    class StoreUpdatePayload implements Payload {
        type = "StoreUpdatePayload";

        constructor(public state: any) {}
    }

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

        dispatchUpdateState(newState: any) {
            this.dispatch(new StoreUpdatePayload(newState));
        }
    }

    class MockStore extends Store {
        constructor() {
            super();
            this.name = `${name}Store`;
            this.state = {};
        }

        receivePayload(payload: Payload) {
            if (payload instanceof StoreUpdatePayload) {
                this.setState(payload.state);
            } else if (isSharedStateChanged && !shallowEqual(this.state, sharedState)) {
                this.setState(sharedState);
                isSharedStateChanged = false;
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
