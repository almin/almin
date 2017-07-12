// MIT © 2017 azu
import { Store } from "../Store";
// Apply: StoreMap -> StateMap
// { stateName: Store }
// T[P] as Store<State>
// Now, State is T[P}
export type StoreMap<T> = { [P in keyof T]: Store<T[P]> };
// { stateName: State }
// StoreMap define T[P]
// Now, T[P] is State
export type StateMap<T> = { [P in keyof T]: T[P] };

/**
 * @deprecated
 * Use `typeof storeGroup.state` insteadof it.
 * See https://github.com/almin/almin/issues/212
 *
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
export function StoreToState<T>(mapping: StoreMap<T>): StateMap<T> {
    return mapping as any;
}
