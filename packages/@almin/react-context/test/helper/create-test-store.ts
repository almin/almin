import { Store } from "almin";

export const createTestStore = <T extends {}>(initialState: T) => {
    class TestStore extends Store<T> {
        state: T;

        constructor() {
            super();
            this.state = initialState;
        }

        updateState(newState: T) {
            if (this.state !== newState) {
                this.state = newState;
                this.emitChange();
            }
        }

        getState() {
            return this.state;
        }
    }

    return new TestStore();
};
