import { Context, UseCase } from "almin";
import { DuplicateChecker } from "./DuplicateChecker";

export type Construct<T> = {
    new (...args: any[]): T;
};
export type Factory<T, Command = any> = (command: Command) => T;

export interface UseCaseBinderArgs<T, P> {
    context: Context<any>;
    CommandConstructors: T[];
    useCases: P[];
    duplicateChecker: DuplicateChecker;
}

export class UseCaseBinder<Command, P extends Factory<UseCase, any>> {
    private context: Context<any>;
    private CommandConstructors: Construct<Command>[] = [];
    private useCases: P[] = [];
    private duplicateChecker: DuplicateChecker;

    constructor(args: UseCaseBinderArgs<Construct<Command>, P>) {
        this.context = args.context;
        this.CommandConstructors = args.CommandConstructors;
        this.useCases = args.useCases;
        this.duplicateChecker = args.duplicateChecker;
    }

    bind<K extends Construct<Command>, V extends UseCase>(
        CommandConstructor: K,
        useCase: V
    ): UseCaseBinder<K | Command, Factory<V> | P> {
        if (this.duplicateChecker.hasCommand(CommandConstructor)) {
            throw new Error(`This Command is already bound. One Command to One UseCase. ${CommandConstructor}`);
        }
        if (this.duplicateChecker.hasUseCase(useCase)) {
            throw new Error(`This UseCase is already bound. One Command to One UseCase. ${useCase}`);
        }
        this.duplicateChecker.addCommand(CommandConstructor);
        this.duplicateChecker.addUseCase(useCase);
        return new UseCaseBinder({
            context: this.context,
            CommandConstructors: [...this.CommandConstructors, CommandConstructor],
            useCases: [...this.useCases, () => useCase],
            duplicateChecker: this.duplicateChecker
        });
    }

    bindFactory<K extends Construct<Command>, V extends Factory<UseCase, any>>(
        CommandConstructor: K,
        useCaseFactory: V
    ): UseCaseBinder<K | Command, V | P> {
        if (this.CommandConstructors.indexOf(CommandConstructor) !== -1) {
            throw new Error(`This Command is already bound. One Command to One UseCase. ${CommandConstructor}`);
        }
        if (this.duplicateChecker.hasUseCaseFactory(useCaseFactory)) {
            throw new Error(`This UseCaseFactory is already bound. One Command to One UseCase. ${useCaseFactory}`);
        }
        this.duplicateChecker.addCommand(CommandConstructor);
        this.duplicateChecker.addUseCaseFactory(useCaseFactory);
        return new UseCaseBinder({
            context: this.context,
            CommandConstructors: [...this.CommandConstructors, CommandConstructor],
            useCases: [...this.useCases, useCaseFactory],
            duplicateChecker: this.duplicateChecker
        });
    }

    send(command: Command) {
        const CommandConstructor = (command as any).constructor;
        if (!CommandConstructor) {
            throw new Error(`This command have not .constructor property: ${command}`);
        }
        const index = this.CommandConstructors.indexOf(CommandConstructor);
        if (index === -1) {
            throw new Error(`This command have not mapped any UseCase: ${command}`);
        }
        const useCase = this.useCases[index](command);
        return this.context.useCase(useCase).executor(useCase => useCase.execute(command));
    }
}

/**
 * A mediator for UseCase and Command.
 * A UseCase is almin's UseCase implementation.
 * A Command is UseCase#execute
 *
 * @example
 *
 * ```
 * const container = UseCaseContainer
 *   .create(context)
 *   .bind(TestCommandA, new TestUseCase())
 *   .bind(TestCommandB, new TestUseCase());
 * container.send(new TestCommandA())
 *   .then(() => {})
 *   .catch(error => {});
 * ```
 *
 *
 */
export class UseCaseBus {
    static create(context: Context<any>) {
        return {
            bind: function<K, V extends UseCase>(
                CommandConstructor: Construct<K>,
                useCase: V
            ): UseCaseBinder<K, () => V> {
                const duplicateChecker = new DuplicateChecker();

                duplicateChecker.addCommand(CommandConstructor);
                duplicateChecker.addUseCase(useCase);
                return new UseCaseBinder({
                    context,
                    CommandConstructors: [CommandConstructor],
                    useCases: [() => useCase],
                    duplicateChecker
                });
            },
            bindFactory: function<K, V extends Factory<UseCase, K>>(
                CommandConstructor: Construct<K>,
                useCaseFactory: V
            ): UseCaseBinder<K, V> {
                const duplicateChecker = new DuplicateChecker();

                duplicateChecker.addCommand(CommandConstructor);
                duplicateChecker.addUseCaseFactory(useCaseFactory);
                return new UseCaseBinder({
                    context,
                    CommandConstructors: [CommandConstructor],
                    useCases: [useCaseFactory],
                    duplicateChecker
                });
            }
        };
    }
}
