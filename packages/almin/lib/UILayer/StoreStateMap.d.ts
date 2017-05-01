import MapLike from "map-like";
import { Store } from "../Store";
import { StoreMap } from "./StoreGroupTypes";
/**
 * TODO: make strong type
 */
export declare class StoreStateMap extends MapLike<Store, string> {
    readonly stores: Array<Store>;
    readonly stateNames: Array<string>;
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
export declare function createStoreStateMap<T>(mappingObject: StoreMap<T>): StoreStateMap;
