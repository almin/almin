// MIT © 2017 azu
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

export class UseCaseUnitOfWork {
    private unitOfWork: UnitOfWork;
    private finishedUseCaseMap: MapLike<string, boolean>;
    private options: UseCaseUnitOfWorkOptions;
    private unsubscribeMap: MapLike<UseCaseExecutor<any>, () => void>;

    constructor(storeGroup: StoreGroup<any>, options: UseCaseUnitOfWorkOptions) {
        this.unitOfWork = new UnitOfWork(storeGroup);
        this.finishedUseCaseMap = new MapLike<string, boolean>();
        this.options = options;
        this.unsubscribeMap = new MapLike<UseCaseExecutor<any>, () => void>();
        if (this.options.autoCommit) {
            this.unitOfWork.onNewEvent(() => {
                this.commit();
            });
        }
    }

    open(useCaseExecutor: UseCaseExecutor<any>) {
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
        const unsubscribe = useCaseExecutor.onDispatch(onDispatchOnUnitOfWork);
        this.unsubscribeMap.set(useCaseExecutor, unsubscribe);
    }

    commit() {
        this.unitOfWork.commit();
    }

    close(useCaseExecutor: UseCaseExecutor<any>) {
        const unsubsribe = this.unsubscribeMap.get(useCaseExecutor);
        if (typeof unsubsribe !== "function") {
            if (process.env.NODE_ENV !== "production") {
                console.warn("Warning: This UseCaseExecutor is not opened or already closed.", useCaseExecutor);
            }
            return;
        }
        unsubsribe();
        this.unsubscribeMap.delete(useCaseExecutor);
    }

    release() {
        this.unsubscribeMap.values().forEach(unsubsrcibe => {
            unsubsrcibe();
        });
        this.unitOfWork.close();
    }
}
