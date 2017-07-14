// MIT © 2017 azu
import { Payload } from "../payload/Payload";
import { DispatcherPayloadMeta } from "../DispatcherPayloadMeta";
import { UnitOfWork } from "./UnitOfWork";
import { MapLike } from "map-like";
import { UseCaseExecutor } from "../UseCaseExecutor";
import { Dispatcher } from "../Dispatcher";
import { StoreGroupLike } from "../UILayer/StoreGroupLike";

export interface UseCaseUnitOfWorkOptions {
    autoCommit: boolean;
}

export interface UseCaseUnitOfWorkArgs {
    name: string;
    dispatcher: Dispatcher;
    storeGroup: StoreGroupLike;
    options: UseCaseUnitOfWorkOptions;
}

/**
 * UseCaseUnitOfWork is a Unit of Work between UseCase and StoreGroup.
 * It aim to manager updating of StoreGroup via UseCase.
 */
export class UseCaseUnitOfWork {
    name: string;
    private unitOfWork: UnitOfWork;
    private dispatcher: Dispatcher;
    private options: UseCaseUnitOfWorkOptions;
    private unsubscribeMap: MapLike<UseCaseExecutor<any>, () => void>;

    constructor(args: UseCaseUnitOfWorkArgs) {
        this.name = args.name;
        this.unitOfWork = new UnitOfWork(args.storeGroup);
        this.dispatcher = args.dispatcher;
        this.options = args.options;
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
            // Notes: It is specific order
            // 1. Commit
            this.unitOfWork.addCommitment([payload, meta]);
            // 2. Dispatch to Dispatcher
            this.dispatcher.dispatch(payload, meta);
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
        this.unsubscribeMap.keys().forEach(useCaseExecutor => {
            this.close(useCaseExecutor);
        });
        this.unitOfWork.release();
    }
}
