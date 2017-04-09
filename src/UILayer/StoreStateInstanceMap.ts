// MIT © 2017 azu
import MapLike from "map-like";
import { Store } from "../Store";
// Store <-> StateName
export class StoreStateNameMap {
    instanceMap = new MapLike<Store, any>();

    has(store: Store): boolean {
        return this.instanceMap.has(store);
    }

    get(store: Store): string | undefined {
        return this.instanceMap.get(store);
    }

    set(store: Store, stateName: string): void {
        this.instanceMap.set(store, stateName);
    }
}
