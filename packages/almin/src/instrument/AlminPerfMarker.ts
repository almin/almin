// MIT © 2017 azu
import { UseCaseLike } from "../UseCaseLike";
import { StoreLike } from "../StoreLike";
import { StoreGroupLike } from "../UILayer/StoreGroupLike";
import { AlminPerfMarkerAbstract, DebugId, MarkType } from "./AlminAbstractPerfMarker";
import { Transaction } from "../DispatcherPayloadMeta";
import { EventEmitter } from "events";

const canUsePerformanceMeasure: boolean =
    typeof performance !== "undefined" &&
    typeof performance.mark === "function" &&
    typeof performance.clearMarks === "function" &&
    typeof performance.measure === "function" &&
    typeof performance.clearMeasures === "function";

export class AlminPerfMarker extends EventEmitter implements AlminPerfMarkerAbstract {
    private _isProfiling = false;

    beginProfile(): void {
        this._isProfiling = true;
    }

    get isProfiling(): boolean {
        return this._isProfiling;
    }

    endProfile(): void {
        this._isProfiling = false;
        this.removeAllListeners();
    }

    shouldMark(_debugId: DebugId) {
        if (!this._isProfiling) {
            return false;
        }
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
        // clear unneeded marks
        performance.clearMarks(markName);
        performance.clearMeasures(measureName);
    };

    beforeStoreGroupReadPhase(debugId: DebugId, _storeGroup: StoreGroupLike): void {
        this.markBegin(debugId, "StoreGroup#read");
        this.emit("beforeStoreGroupReadPhase");
    }

    afterStoreGroupReadPhase(debugId: DebugId, storeGroup: StoreGroupLike): void {
        const displayName = storeGroup.name;
        this.markEnd(debugId, "StoreGroup#read", displayName);
        this.emit("afterStoreGroupReadPhase");
    }

    beforeStoreGroupWritePhase(debugId: DebugId, _storeGroup: StoreGroupLike): void {
        this.markBegin(debugId, "StoreGroup#write");
        this.emit("beforeStoreGroupWritePhase");
    }

    afterStoreGroupWritePhase(debugId: DebugId, storeGroup: StoreGroupLike): void {
        const displayName = storeGroup.name;
        this.markEnd(debugId, "StoreGroup#write", displayName);
        this.emit("afterStoreGroupWritePhase");
    }

    beforeStoreGetState(debugId: DebugId, _store: StoreLike): void {
        this.markBegin(debugId, "Store#getState");
        this.emit("beforeStoreGetState");
    }

    afterStoreGetState(debugId: DebugId, store: StoreLike): void {
        const displayName = store.name;
        this.markEnd(debugId, "Store#getState", displayName);
        this.emit("afterStoreGetState");
    }

    beforeStoreReceivePayload(debugId: DebugId, _store: StoreLike): void {
        this.markBegin(debugId, "Store#receivePayload");
        this.emit("beforeStoreReceivePayload");
    }

    afterStoreReceivePayload(debugId: DebugId, store: StoreLike): void {
        const displayName = store.name;
        this.markEnd(debugId, "Store#receivePayload", displayName);
        this.emit("afterStoreReceivePayload");
    }

    willUseCaseExecute(debugId: DebugId, _useCase: UseCaseLike): void {
        this.markBegin(debugId, "UserCase#execute");
        this.emit("willUseCaseExecute");
    }

    didUseCaseExecute(debugId: DebugId, useCase: UseCaseLike): void {
        const displayName = useCase.name;
        this.markEnd(debugId, "UserCase#execute", displayName);
        // did -> complete
        this.markBegin(debugId, "UserCase#complete");
        this.emit("didUseCaseExecute");
    }

    completeUseCaseExecute(debugId: DebugId, useCase: UseCaseLike): void {
        const displayName = useCase.name;
        this.markEnd(debugId, "UserCase#complete", displayName);
        this.emit("completeUseCaseExecute");
    }

    beginTransaction(debugId: string, _transaction: Transaction): void {
        this.markBegin(debugId, "Transaction");
        this.emit("beginTransaction");
    }

    endTransaction(debugId: string, transaction: Transaction): void {
        const displayName = transaction.name;
        this.markEnd(debugId, "Transaction", displayName);
        this.emit("endTransaction");
    }
}
