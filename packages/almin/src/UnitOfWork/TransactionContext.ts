// MIT © 2017 azu
import { UseCaseLike } from "../UseCaseLike";
import { UseCaseExecutor } from "../UseCaseExecutor";
import { FunctionalUseCase } from "../FunctionalUseCase";
import { UseCaseFunction } from "../FunctionalUseCaseContext";

export interface TransactionContext {
    useCase<T extends UseCaseLike>(useCase: T): UseCaseExecutor<T>;

    useCase(useCase: UseCaseFunction): UseCaseExecutor<FunctionalUseCase>;

    /**
     * Commit current queued payload.
     */
    commit: () => void;
    /**
     * Exit the transaction without commit.
     */
    exit: () => void;
}
