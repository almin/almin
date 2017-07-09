// MIT © 2017 azu
import { StoreGroup } from "./StoreGroup";
import { Store } from "../Store";
import { Dispatcher } from "../Dispatcher";
import { Commitment } from "../UnitOfWork/UnitOfWork";
import { StoreLike } from "../StoreLike";
import { StoreGroupLike } from "./StoreGroupLike";

/**
 * SingleStoreGroup is wrapper of a single Store.
 * It not aim to use in production.
 * It would be used in test or development.
 */
export class SingleStoreGroup<T extends Store> extends Dispatcher implements StoreGroupLike {
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

    commit(commitment: Commitment): void {
        return this.storeGroup.commit(commitment);
    }

    useStrict() {
        return this.storeGroup.useStrict();
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
