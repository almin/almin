// MIT © 2017 azu
import { Payload } from "../payload/Payload";
import { DispatcherPayloadMeta } from "../DispatcherPayloadMeta";
import { isErrorPayload } from "../payload/ErrorPayload";
import { isDidExecutedPayload } from "../payload/DidExecutedPayload";
import { isCompletedPayload } from "../payload/CompletedPayload";
import { Committable, UnitOfWork } from "./UnitOfWork";
import MapLike from "map-like";
import { UseCaseExecutor } from "../UseCaseExecutor";

export interface UseCaseUnitOfWorkOptions {
    autoCommit: boolean;
}

/**
 * UseCaseUnitOfWork is a Unit of Work between UseCase and StoreGroup.
 * It aim to manager updating of StoreGroup via UseCase.
 */
export class UseCaseUnitOfWork {
    private unitOfWork: UnitOfWork;
    private finishedUseCaseMap: MapLike<string, boolean>;
    private options: UseCaseUnitOfWorkOptions;
    private unsubscribeMap: MapLike<UseCaseExecutor<any>, () => void>;

    constructor(storeGroup: Committable, options: UseCaseUnitOfWorkOptions) {
        this.unitOfWork = new UnitOfWork(storeGroup);
        this.finishedUseCaseMap = new MapLike<string, boolean>();
        this.options = options;
        this.unsubscribeMap = new MapLike<UseCaseExecutor<any>, () => void>();
        if (this.options.autoCommit) {
            this.unitOfWork.onAddedCommitment(() => {
                this.commit();
            });
        }
    }

    /**
     * Begin transaction of the useCaseExecutor/UseCase
     */
    open(useCaseExecutor: UseCaseExecutor<any>) {
        const onDispatchOnUnitOfWork = (payload: Payload, meta: DispatcherPayloadMeta) => {
            if (!meta.isTrusted) {
                this.unitOfWork.addCommitment([payload, meta]);
            } else if (isErrorPayload(payload)) {
                this.unitOfWork.addCommitment([payload, meta]);
            } else if (isDidExecutedPayload(payload) && meta.useCase) {
                if (meta.isUseCaseFinished) {
                    this.finishedUseCaseMap.set(meta.useCase.id, true);
                }
                this.unitOfWork.addCommitment([payload, meta]);
            } else if (isCompletedPayload(payload) && meta.useCase && meta.isUseCaseFinished) {
                // if the useCase is already finished, doesn't emitChange in CompletedPayload
                // In other word, If the UseCase that return non-promise value, doesn't emitChange in CompletedPayload
                if (this.finishedUseCaseMap.has(meta.useCase.id)) {
                    this.finishedUseCaseMap.delete(meta.useCase.id);
                    return;
                }
                this.unitOfWork.addCommitment([payload, meta]);
            }
        };
        const unsubscribe = useCaseExecutor.onDispatch(onDispatchOnUnitOfWork);
        this.unsubscribeMap.set(useCaseExecutor, unsubscribe);
    }

    /**
     * Commit current queued payload to Committable StoreGroup.
     * After commit, prune current queue.
     */
    commit() {
        this.unitOfWork.commit();
    }

    /**
     * End transaction of the useCaseExecutor/UseCase
     */
    close(useCaseExecutor: UseCaseExecutor<any>) {
        const unsubscribe = this.unsubscribeMap.get(useCaseExecutor);
        if (typeof unsubscribe !== "function") {
            if (process.env.NODE_ENV !== "production") {
                console.warn("Warning: This UseCaseExecutor is not opened or already closed.", useCaseExecutor);
            }
            return;
        }
        unsubscribe();
        this.unsubscribeMap.delete(useCaseExecutor);
    }

    /**
     * Release this Unit of Work.
     * After released, can't commit this Unit of Work.
     */
    release() {
        this.unsubscribeMap.values().forEach(unsubscribe => {
            unsubscribe();
        });
        this.unitOfWork.release();
    }
}
