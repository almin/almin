// MIT © 2017 azu
import { Payload } from "../payload/Payload";
import { DispatcherPayloadMeta, DispatcherPayloadMetaImpl, Transaction } from "../DispatcherPayloadMeta";
import { Commitment, UnitOfWork } from "./UnitOfWork";
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
    private storeGroup: StoreGroupLike;
    private options: UseCaseUnitOfWorkOptions;
    private unsubscribeMap: MapLike<UseCaseExecutor<any>, () => void>;
    private isTransactionWorking: boolean;
    // Does the user have been commit or exit action at least one?
    private doesReflectActionAtLeastOne: boolean;

    constructor(args: UseCaseUnitOfWorkArgs) {
        this.name = args.name;
        this.storeGroup = args.storeGroup;
        this.unitOfWork = new UnitOfWork(this.storeGroup);
        this.dispatcher = args.dispatcher;
        this.options = args.options;
        this.unsubscribeMap = new MapLike<UseCaseExecutor<any>, () => void>();
        this.isTransactionWorking = false;
        this.doesReflectActionAtLeastOne = false;
        if (this.options.autoCommit) {
            this.unitOfWork.onAddedCommitment(() => {
                this.unitOfWork.commit();
            });
        }
    }

    /**
     * Unique id
     */
    get id() {
        return this.unitOfWork.id;
    }

    /**
     * Is Unit of Work already disposed?
     */
    get isDisposed() {
        return this.unitOfWork.isDisposed;
    }

    /**
     * current queued commitment size
     */
    get size() {
        return this.unitOfWork.size;
    }

    /**
     * count of current working useCases
     */
    get workingUseCaseCount() {
        return this.unsubscribeMap.size;
    }

    beginTransaction() {
        const transaction: Transaction = {
            id: this.id,
            name: this.name
        };
        this.isTransactionWorking = true;
        const payload = new TransactionBeganPayload(this.name);
        const meta = new DispatcherPayloadMetaImpl({
            isTrusted: true,
            transaction: transaction
        });
        this.dispatcher.dispatch(payload, meta);
        this.unitOfWork.addCommitment({
            payload,
            meta,
            debugId: transaction.id
        });
    }

    /**
     * Begin transaction of the useCaseExecutor/UseCase
     */
    open(useCaseExecutor: UseCaseExecutor<any>) {
        const onDispatchOnUnitOfWork = (payload: Payload, meta: DispatcherPayloadMeta) => {
            // If unit of work is working as transaction, overwrite meta.transaction
            if (this.isTransactionWorking) {
                meta.transaction = {
                    id: this.id,
                    name: this.name
                };
            }
            // Notes: It is specific order for updating store logging
            // 1. Commit
            this.unitOfWork.addCommitment({
                payload,
                meta,
                debugId: this.id
            });
            // 2. Dispatch to Dispatcher
            this.dispatcher.dispatch(payload, meta);
        };
        const unsubscribe = useCaseExecutor.onDispatch(onDispatchOnUnitOfWork);
        this.unsubscribeMap.set(useCaseExecutor, unsubscribe);
    }

    /**
     * Commit current queued payload to Committable StoreGroup.
     * After commit, prune current queue.
     *
     * ## Notes
     *
     * Do `commit()` and then this unit of work will be released.
     */
    commit() {
        // transaction commit work only once
        if (this.doesReflectActionAtLeastOne) {
            throw new Error(`Error(Transaction): This unit of work is already commit() or exit().
Not to allow to do multiple commits in a transaction`);
        }
        if (!this.isTransactionWorking) {
            this.unitOfWork.commit();
        } else {
            const commitment = this.createTransactionEndPayload();
            // Notes: It is specific order for updating store logging
            // 1. commit
            this.unitOfWork.addCommitment(commitment);
            this.unitOfWork.commit();
            // 2. dispatch
            this.dispatcher.dispatch(commitment.payload, commitment.meta);
            this.isTransactionWorking = false;
        }
        // commit flag
        this.doesReflectActionAtLeastOne = true;
    }

    private createTransactionEndPayload(): Commitment {
        const transaction: Transaction = {
            id: this.id,
            name: this.name
        };
        // payload, meta
        const payload = new TransactionEndedPayload(this.name);
        const meta = new DispatcherPayloadMetaImpl({
            isTrusted: true,
            transaction: transaction
        });
        return {
            payload,
            meta,
            debugId: this.id
        };
    }

    /**
     * End transaction of the useCaseExecutor/UseCase
     */
    close(useCaseExecutor: UseCaseExecutor<any>) {
        const unsubscribe = this.unsubscribeMap.get(useCaseExecutor);
        if (typeof unsubscribe !== "function") {
            console.error(
                "Warning(UnitOfWork): This UseCaseExecutor is not opened or already closed.",
                useCaseExecutor
            );
            return;
        }
        unsubscribe();
        this.unsubscribeMap.delete(useCaseExecutor);
    }

    exit() {
        // transaction exit work only once
        if (this.doesReflectActionAtLeastOne) {
            throw new Error(`Error(Transaction): This unit of work is already commit() or exit().
Disallow to do multiple exit in a transaction`);
        }
        this.doesReflectActionAtLeastOne = true;
        if (this.isTransactionWorking) {
            const commitment = this.createTransactionEndPayload();
            this.dispatcher.dispatch(commitment.payload, commitment.meta);
            this.isTransactionWorking = false;
        }
    }

    /**
     * Release this Unit of Work.
     * After released, can't commit this Unit of Work.
     *
     * Please call `exit` or `commit at once before releasing.
     */
    release() {
        if (!this.options.autoCommit && !this.doesReflectActionAtLeastOne) {
            if (process.env.NODE_ENV !== "production") {
                console.error(`Warning(UnitOfWork): Transaction(${
                    this.name
                }) should be commit() or exit() at least one. 
If you not want to commit, Please call \`transactionContext.exit()\` at end of transaction.
`);
            }
            this.exit();
        }
        this.unsubscribeMap.keys().forEach(useCaseExecutor => {
            this.close(useCaseExecutor);
        });
        this.unitOfWork.release();
    }
}
