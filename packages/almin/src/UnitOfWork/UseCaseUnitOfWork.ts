// MIT © 2017 azu
import { UseCaseLike } from "../UseCaseLike";
import { Payload } from "../payload/Payload";
import { DispatcherPayloadMeta } from "../DispatcherPayloadMeta";
import { isErrorPayload } from "../payload/ErrorPayload";
import { isDidExecutedPayload } from "../payload/DidExecutedPayload";
import { isCompletedPayload } from "../payload/CompletedPayload";
import { UnitOfWork } from "./UnitOfWork";
import { StoreGroup } from "../UILayer/StoreGroup";
import MapLike from "map-like";
import { UseCaseExecutor } from "../UseCaseExecutor";

export interface UseCaseUnitOfWorkOptions {
    autoCommit: boolean;
}

export class UseCaseUnitOfWork<T extends UseCaseLike> {
    private useCaseExecutor: UseCaseExecutor<T>;
    private unitOfWork: UnitOfWork;
    private finishedUseCaseMap: MapLike<string, boolean>;
    private unDispatch: Function | undefined;
    private options: UseCaseUnitOfWorkOptions;

    constructor(useCaseExecutor: UseCaseExecutor<T>, storeGroup: StoreGroup<any>, options: UseCaseUnitOfWorkOptions) {
        this.useCaseExecutor = useCaseExecutor;
        this.unitOfWork = new UnitOfWork(storeGroup);
        this.finishedUseCaseMap = new MapLike<string, boolean>();
        this.options = options;
    }

    open() {
        if (this.options.autoCommit) {
            this.unitOfWork.onNewEvent(() => {
                this.commit();
            });
        }
        const onDispatchOnUnitOfWork = (payload: Payload, meta: DispatcherPayloadMeta) => {
            if (!meta.isTrusted) {
                this.unitOfWork.addEvent(payload);
            } else if (isErrorPayload(payload)) {
                this.unitOfWork.addEvent(payload);
            } else if (isDidExecutedPayload(payload) && meta.useCase) {
                if (meta.isUseCaseFinished) {
                    this.finishedUseCaseMap.set(meta.useCase.id, true);
                }
                this.unitOfWork.addEvent(payload);
            } else if (isCompletedPayload(payload) && meta.useCase && meta.isUseCaseFinished) {
                // if the useCase is already finished, doesn't emitChange in CompletedPayload
                // In other word, If the UseCase that return non-promise value, doesn't emitChange in CompletedPayload
                if (this.finishedUseCaseMap.has(meta.useCase.id)) {
                    this.finishedUseCaseMap.delete(meta.useCase.id);
                    return;
                }
                this.unitOfWork.addEvent(payload);
            }
        };
        this.unDispatch = this.useCaseExecutor.onDispatch(onDispatchOnUnitOfWork);
    }

    commit() {
        this.unitOfWork.commit();
    }

    close() {
        if (typeof this.unDispatch === "function") {
            this.unDispatch();
        }
        this.unitOfWork.close();
    }
}
