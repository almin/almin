// MIT © 2017 azu
import { Store } from "../Store";
// { stateName: Store }
export type StoreMap<T> = {
    // T[P] as Store<State>
    // Now, State is T[P}
    [P in keyof T]: Store<T[P]>
};
// { stateName: State }
export type StateMap<T> = {
    // StoreMap define T[P]
    // Now, T[P] is State
    [P in keyof T]: T[P]
};

/**
 * Utility type function that create state mapping from store mapping.
 *
 * DO NOT USE the returned value.
 * It should be used for typing.
 *
 * ## Example
 *
 * ```ts
 * import { StoreGroupTypes } from "almin";
 * // store mapping
 * const storeMapping = {
 *    appState: new AppStore({ appRepository }),
 *    counterState: new CounterStore({ appRepository })
 * };
 * // state mapping
 * const stateMapping = StoreGroupTypes.StoreToState(storeMapping);
 * // typeof StoreGroup state
 * export type AppStoreGroupState = typeof stateMapping;
 * ```
 */
function StoreToState<T>(mapping: StoreMap<T>): StateMap<T> {
    return mapping as any;
}
