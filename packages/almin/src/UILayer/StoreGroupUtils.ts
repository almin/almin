// MIT © 2017 azu
"use strict";
import { Store } from "../Store";

/**
 * shouldStateUpdate logic.
 * use Store#shouldStateUpdate if it is implemented in the Store.
 * In other case, use strict equal `===` by default.
 */
export const shouldStateUpdate = (store: Store, prevState: any, nextState: any): boolean => {
    if (typeof store.shouldStateUpdate === "function") {
        return store.shouldStateUpdate(prevState, nextState);
    }
    return prevState !== nextState;
};
