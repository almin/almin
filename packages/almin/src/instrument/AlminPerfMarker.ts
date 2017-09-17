// MIT © 2017 azu
import { UseCaseLike } from "../UseCaseLike";
import { StoreLike } from "../StoreLike";
import { StoreGroupLike } from "../UILayer/StoreGroupLike";
import { AlminPerfMarkerAbstract, DebugId, MarkType } from "./AlminAbstractPerfMarker";
import { Transaction } from "../DispatcherPayloadMeta";

const canUsePerformanceMeasure: boolean =
    typeof performance !== "undefined" &&
    typeof performance.mark === "function" &&
    typeof performance.clearMarks === "function" &&
    typeof performance.measure === "function" &&
    typeof performance.clearMeasures === "function";

export class AlminPerfMarker implements AlminPerfMarkerAbstract {
    shouldMark(_debugId: DebugId) {
        return canUsePerformanceMeasure;
    }

    markBegin = (debugID: DebugId, markType: MarkType) => {
        if (!this.shouldMark(debugID)) {
            return;
        }
        const markName = `almin::${debugID}::${markType}`;
        performance.mark(markName);
    };

    markEnd = (debugID: DebugId, markType: MarkType, displayName: string) => {
        if (!this.shouldMark(debugID)) {
            return;
        }
        const markName = `almin::${debugID}::${markType}`;
        const measureName = `${displayName} [${markType}]`;
        performance.measure(measureName, markName);
        performance.clearMarks(markName);
    };

    beforeStoreGroupReadPhase(debugId: DebugId, _storeGroup: StoreGroupLike): void {
        this.markBegin(debugId, "StoreGroup#readPhase");
    }

    afterStoreGroupReadPhase(debugId: DebugId, storeGroup: StoreGroupLike): void {
        const displayName = storeGroup.name;
        this.markEnd(debugId, "StoreGroup#readPhase", displayName);
    }

    beforeStoreGroupWritePhase(debugId: DebugId, _storeGroup: StoreGroupLike): void {
        this.markBegin(debugId, "StoreGroup#writePhase");
    }

    afterStoreGroupWritePhase(debugId: DebugId, storeGroup: StoreGroupLike): void {
        const displayName = storeGroup.name;
        this.markEnd(debugId, "StoreGroup#writePhase", displayName);
    }

    beforeStoreGetState(debugId: DebugId, _store: StoreLike): void {
        this.markBegin(debugId, "Store#getState");
    }

    afterStoreGetState(debugId: DebugId, store: StoreLike): void {
        const displayName = store.name;
        this.markEnd(debugId, "Store#getState", displayName);
    }

    beforeStoreReceivePayload(debugId: DebugId, _store: StoreLike): void {
        this.markBegin(debugId, "Store#receivePayload");
    }

    afterStoreReceivePayload(debugId: DebugId, store: StoreLike): void {
        const displayName = store.name;
        this.markEnd(debugId, "Store#receivePayload", displayName);
    }

    beforeUseCaseExecute(debugId: DebugId, _useCase: UseCaseLike): void {
        this.markBegin(debugId, "UserCase#execute");
    }

    afterUseCaseExecute(debugId: DebugId, useCase: UseCaseLike): void {
        const displayName = useCase.name;
        this.markEnd(debugId, "UserCase#execute", displayName);
    }

    beginTransaction(debugId: string, _transaction: Transaction): void {
        this.markBegin(debugId, "Transaction");
    }

    endTransaction(debugId: string, transaction: Transaction): void {
        const displayName = transaction.name;
        this.markEnd(debugId, "Transaction", displayName);
    }
}
