// MIT © 2017 azu
import { Payload } from "../payload/Payload";
import { DispatcherPayloadMeta, DispatcherPayloadMetaImpl } from "../DispatcherPayloadMeta";
import { UnitOfWork } from "./UnitOfWork";
import { MapLike } from "map-like";
import { UseCaseExecutor } from "../UseCaseExecutor";
import { Dispatcher } from "../Dispatcher";
import { StoreGroupLike } from "../UILayer/StoreGroupLike";
import { TransactionBeganPayload } from "../payload/TransactionBeganPayload";
import { TransactionEndedPayload } from "../payload/TransactionEndedPayload";

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
    private isTransactionWorking: boolean;

    constructor(args: UseCaseUnitOfWorkArgs) {
        this.name = args.name;
        this.unitOfWork = new UnitOfWork(args.storeGroup);
        this.dispatcher = args.dispatcher;
        this.options = args.options;
        this.unsubscribeMap = new MapLike<UseCaseExecutor<any>, () => void>();
        this.isTransactionWorking = false;
        if (this.options.autoCommit) {
            this.unitOfWork.onAddedCommitment(() => {
                this.commit();
            });
        }
    }

    beginTransaction() {
        const payload = new TransactionBeganPayload(this.name);
        const meta = new DispatcherPayloadMetaImpl({
            // this dispatch payload generated by this UseCase
            useCase: undefined,
            // dispatcher is the UseCase
            dispatcher: this.dispatcher,
            // parent is the same with UseCase. because this useCase dispatch the payload
            parentUseCase: null,
            // the user create this payload
            isTrusted: true,
            // Always false because the payload is dispatched from this working useCase.
            isUseCaseFinished: false,
            transaction: {
                name: this.name
            }
        });
        this.dispatcher.dispatch(payload, meta);
        this.isTransactionWorking = true;
    }

    /**
     * Begin transaction of the useCaseExecutor/UseCase
     */
    open(useCaseExecutor: UseCaseExecutor<any>) {
        const onDispatchOnUnitOfWork = (payload: Payload, meta: DispatcherPayloadMeta) => {
            // If unit of work is working as transaction, overwrite meta.transaction
            if (this.isTransactionWorking) {
                meta.transaction = {
                    name: this.name
                };
            }
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

    endTransaction() {
        if (!this.isTransactionWorking) {
            if (process.env.NODE_ENV !== "production") {
                console.error(`Warning(Transaction): Transaction(${this.name}) is already ended.`);
            }
            return;
        }
        const payload = new TransactionEndedPayload(this.name);
        const meta = new DispatcherPayloadMetaImpl({
            // this dispatch payload generated by this UseCase
            useCase: undefined,
            // dispatcher is the UseCase
            dispatcher: this.dispatcher,
            // parent is the same with UseCase. because this useCase dispatch the payload
            parentUseCase: null,
            // the user create this payload
            isTrusted: true,
            // Always false because the payload is dispatched from this working useCase.
            isUseCaseFinished: false,
            transaction: {
                name: this.name
            }
        });
        this.dispatcher.dispatch(payload, meta);
        this.isTransactionWorking = false;
    }

    /**
     * Release this Unit of Work.
     * After released, can't commit this Unit of Work.
     */
    release() {
        if (this.isTransactionWorking) {
            this.endTransaction();
        }
        this.unsubscribeMap.keys().forEach(useCaseExecutor => {
            this.close(useCaseExecutor);
        });
        this.unitOfWork.release();
    }
}
