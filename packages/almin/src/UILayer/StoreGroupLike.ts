// MIT © 2017 azu
import { Dispatcher } from "../Dispatcher";
import { StoreLike } from "../StoreLike";
import { Committable } from "../UnitOfWork/UnitOfWork";

export interface StoreGroupExtension {
    useStrict(): void;
}

export type StoreGroupLike = StoreGroupExtension & Dispatcher & StoreLike<any> & Committable;
