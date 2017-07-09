// MIT © 2017 azu
import { StoreGroup } from "./StoreGroup";
import { Store } from "../Store";
import { Dispatcher } from "../Dispatcher";
import { Committable } from "../UnitOfWork/UnitOfWork";
import { Payload } from "../payload/Payload";
import { StoreLike } from "../StoreLike";
import { DispatcherPayloadMeta } from "../DispatcherPayloadMeta";

export class SingleStoreGroup<T extends Store> extends Dispatcher implements StoreLike<T["state"]>, Committable {
    private storeGroup: StoreGroup<{ target: T }>;

    constructor(store: T) {
        super();
        this.storeGroup = new StoreGroup({
            target: store
        });
        this.pipe(this.storeGroup);
    }

    onChange(handler: (stores: StoreLike<any>[]) => void): () => void {
        return this.storeGroup.onChange(handler);
    }

    commit(payload: Payload, meta: DispatcherPayloadMeta): void {
        return this.storeGroup.commit(payload, meta);
    }

    getState(): T["state"] {
        return this.storeGroup.getState().target;
    }

    emitChange(): void {
        return this.storeGroup.emitChange();
    }


    release(): void {
        return this.storeGroup.release();
    }
}

export const createSingleStoreGroup = <T extends Store>(store: T): SingleStoreGroup<T> => {
    return new SingleStoreGroup(store);
};
