// MIT © 2017 azu
import { Dispatcher, DispatchedPayload } from "../Dispatcher";
import { StoreLike } from "../StoreLike";
import { Committable } from "../UnitOfWork/UnitOfWork";
import { DispatcherPayloadMeta } from "../DispatcherPayloadMeta";

export interface StoreGroupChangeResult {
    stores: Array<StoreLike<any>>;
    // change reason;
    payload?: DispatchedPayload;
    meta?: DispatcherPayloadMeta;
}

export interface StoreGroupExtension {
    useStrict(): void;

    onChangeDetails(handler: (changeResult: StoreGroupChangeResult) => void): () => void;
}

export type StoreGroupLike = StoreGroupExtension & StoreLike<any> & Dispatcher & Committable;
