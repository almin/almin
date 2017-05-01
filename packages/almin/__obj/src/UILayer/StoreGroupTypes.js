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
export function StoreToState(mapping) {
    return mapping;
}
