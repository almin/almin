// MIT © 2017 azu
import { DispatcherPayloadMetaImpl } from "../DispatcherPayloadMeta";
import { UseCaseExecutor } from "../UseCaseExecutor";
import { UseCaseUnitOfWork, UseCaseUnitOfWorkArgs } from "./UseCaseUnitOfWork";
import { Dispatcher } from "../Dispatcher";
import { BeginTransactionPayload } from "../payload/BeginTransactionPayload";
import { EndTransactionPayload } from "../payload/EndTransactionPayload";

/**
 * TransactionUseCaseUnitOfWork is a transactional Unit of Work.
 */
export class TransactionUseCaseUnitOfWork {
    private unitOfWork: UseCaseUnitOfWork;
    private dispatcher: Dispatcher;
    private isTransactionWorking: boolean;

    constructor(args: UseCaseUnitOfWorkArgs) {
        this.dispatcher = args.dispatcher;
        this.unitOfWork = new UseCaseUnitOfWork(args);
        this.isTransactionWorking = false;
    }

    beginTransaction() {
        const payload = new BeginTransactionPayload(this.unitOfWork.name);
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
            isUseCaseFinished: false
        });
        this.dispatcher.dispatch(payload, meta);
        this.isTransactionWorking = true;
    }

    /**
     * Begin transaction of the useCaseExecutor/UseCase
     */
    open(useCaseExecutor: UseCaseExecutor<any>) {
        this.unitOfWork.open(useCaseExecutor);
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
        this.unitOfWork.close(useCaseExecutor);
    }

    endTransaction() {
        if (!this.isTransactionWorking) {
            if (process.env.NODE_ENV !== "production") {
                console.error(`Warning(Transaction): Transaction(${this.unitOfWork.name}) is already ended.`);
            }
            return;
        }
        const payload = new EndTransactionPayload(this.unitOfWork.name);
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
            isUseCaseFinished: false
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
        this.unitOfWork.release();
    }
}
