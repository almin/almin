// MIT © 2017 azu
import { MapLike } from "map-like";
import { Store } from "../Store";

// ====
// Note: This module doesn't show warning in production
// ====
/**
 * Warning: check strict updating for each store
 * In strict mode, whenever Store state is mutated outside of mutation handlers, show warning error.
 * This ensures that all state mutations can be explicitly tracked by almin.
 *
 * https://github.com/almin/almin/issues/201
 */
export class StoreGroupChangingStoreStrictChecker {
    // white list for allowing to update
    private allowedChangingStoreMap = new MapLike<Store<any>, boolean>();

    /**
     * allow `store` to update
     */
    mark(store: Store) {
        this.allowedChangingStoreMap.set(store, true);
    }

    /**
     * Is this `store` allowed to update?
     */
    isMarked(store: Store): boolean {
        return this.allowedChangingStoreMap.has(store);
    }

    /**
     * disallow `store` to update
     */
    unMark(store: Store) {
        this.allowedChangingStoreMap.delete(store);
    }

    /**
     * Warning: Show warning message if the `store` is not allowed update.
     * We recommenced to update the `store` in `Store#receivePayload` implementation.
     *
     * ## Example
     *
     * ```js
     * class MyStore extends Store {
     *  receivePayload(){
     *    this.setState({ newState });
     *  }
     * }
     * ```
     */
    warningIfStoreIsNotAllowedUpdate(store: Store) {
        if (!this.isMarked(store)) {
            // TODO: should we support async update in receivePayload?
            console.error(`Warning(Store): ${store.name} can only update own state in ${
                store.name
            }#receivePayload in strict mode.
If you update the state outside of ${store.name}#receivePayload, please check the ${store.name}.
See https://almin.js.org/docs/en/strict-mode.html
`);
        }
    }
}
