// MIT © 2017 azu
import { UseCaseLike } from "../UseCaseLike";
import { UseCaseExecutor } from "../UseCaseExecutor";
import { FunctionalUseCase } from "../FunctionalUseCase";
import { UseCaseFunction } from "../FunctionalUseCaseContext";

export interface TransactionContext {
    /**
     * Unique id
     */
    id: string;

    /**
     * Create new UseCaseExecutor and run useCase in the transaction
     */
    useCase<T extends UseCaseLike>(useCase: T): UseCaseExecutor<T>;

    useCase(useCase: UseCaseFunction): UseCaseExecutor<FunctionalUseCase>;

    /**
     * Commit current queued payloads and exit the transaction.
     */
    commit: () => void;
    /**
     * Exit the transaction without commit.
     */
    exit: () => void;
}
