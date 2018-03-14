import { Construct, Factory } from "./UseCaseCommandBus";
import { UseCase } from "almin";

/**
 * Duplicate definition checker
 */
export class DuplicateChecker {
    private Commands: Construct<{}>[] = [];
    private useCases: UseCase[] = [];
    private useCaseFactories: Factory<UseCase>[] = [];

    addCommand(command: Construct<{}>) {
        this.Commands.push(command);
    }

    addUseCase(useCase: UseCase) {
        this.useCases.push(useCase);
    }

    addUseCaseFactory(useCaseFactory: Factory<UseCase>) {
        this.useCaseFactories.push(useCaseFactory);
    }

    hasCommand(command: Construct<{}>) {
        return this.Commands.indexOf(command) !== -1;
    }

    hasUseCase(useCase: UseCase) {
        return this.useCases.indexOf(useCase) !== -1;
    }

    hasUseCaseFactory(useCaseFactory: Factory<UseCase>) {
        return this.useCaseFactories.indexOf(useCaseFactory) !== -1;
    }
}
