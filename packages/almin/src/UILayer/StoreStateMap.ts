// MIT © 2017 azu
import { MapLike } from "map-like";
import { Store } from "../Store";
import { StoreMap } from "./StoreGroupTypes";

/**
 * TODO: make strong type
 */
export class StoreStateMap extends MapLike<Store, string> {
    get stores(): Array<Store> {
        return this.keys();
    }

    get stateNames(): Array<string> {
        return this.values();
    }
}

/**
 * Create StateStoreMap from mapping object
 *
 * ## Mapping object
 *
 * - key: state name
 * - value: store instance
 *
 * ```js
 * var mapping = {
 *  "stateName": store
 * }
 * ```
 */
export function createStoreStateMap<T>(mappingObject: StoreMap<T>): StoreStateMap {
    const map = new StoreStateMap();
    // Suppress: Element implicitly has an 'any' type because type 'StoreMap<T>' has no index signature.
    const keys = Object.keys(mappingObject) as (keyof T)[];
    for (let i = 0; i < keys.length; i++) {
        const stateName = keys[i];
        const store = mappingObject[stateName];
        map.set(store, stateName);
    }
    return map;
}
