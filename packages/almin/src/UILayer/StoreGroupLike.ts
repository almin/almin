// MIT © 2017 azu
import { Dispatcher, DispatchedPayload } from "../Dispatcher";
import { StoreLike } from "../StoreLike";
import { Committable } from "../UnitOfWork/UnitOfWork";
import { DispatcherPayloadMeta } from "../DispatcherPayloadMeta";

/**
 * The details that describe the reason for change of the store group.
 */
export interface StoreGroupReasonForChange {
    payload?: DispatchedPayload;
    meta?: DispatcherPayloadMeta;
}

export interface StoreGroupExtension {
    useStrict(): void;

    onChange(handler: (stores: Array<StoreLike<any>>, details?: StoreGroupReasonForChange) => void): () => void;
}

export type StoreGroupLike = StoreGroupExtension & StoreLike<any> & Dispatcher & Committable;
