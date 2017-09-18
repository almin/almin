import { StoreGroupLike } from "../UILayer/StoreGroupLike";
import { StoreLike } from "../StoreLike";
import { UseCaseLike } from "../UseCaseLike";
import { Transaction } from "../DispatcherPayloadMeta";

export type DebugId = string;
export type MarkType =
    | "StoreGroup#read"
    | "StoreGroup#write"
    | "Store#getState"
    | "Store#receivePayload"
    | "UserCase#execute"
    | "UserCase#complete"
    | "Transaction";

export abstract class AlminPerfMarkerAbstract {
    abstract beginProfile(): void;

    abstract get isProfiling(): boolean;

    abstract endProfile(): void;

    abstract shouldMark(debugId: DebugId): boolean;

    // StoreGroup#read
    abstract beforeStoreGroupReadPhase(debugId: DebugId, storeGroup: StoreGroupLike): void;

    abstract afterStoreGroupReadPhase(debugId: DebugId, storeGroup: StoreGroupLike): void;

    // StoreGroup#write
    abstract beforeStoreGroupWritePhase(debugId: DebugId, storeGroup: StoreGroupLike): void;

    abstract afterStoreGroupWritePhase(debugId: DebugId, storeGroup: StoreGroupLike): void;

    // Store#getStore
    abstract beforeStoreGetState(debugId: DebugId, store: StoreLike): void;

    abstract afterStoreGetState(debugId: DebugId, store: StoreLike): void;

    // Store#receivePayload
    abstract beforeStoreReceivePayload(debugId: DebugId, store: StoreLike): void;

    abstract afterStoreReceivePayload(debugId: DebugId, store: StoreLike): void;

    // UserCase#execute
    abstract willUseCaseExecute(debugId: DebugId, useCase: UseCaseLike): void;

    abstract didUseCaseExecute(debugId: DebugId, useCase: UseCaseLike): void;

    abstract completeUseCaseExecute(debugId: DebugId, useCase: UseCaseLike): void;

    // Context#transation
    abstract beginTransaction(debugId: DebugId, transaction: Transaction): void;

    abstract endTransaction(debugId: DebugId, transaction: Transaction): void;
}
