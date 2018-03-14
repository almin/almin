import { Context, UseCase } from "almin";
import { DuplicateChecker } from "./DuplicateChecker";

export type Construct<T> = {
    new (...args: any[]): T;
};
export type Factory<T, Command = any> = (command: Command) => T;

export interface UseCaseBinderArgs<T, P> {
    context: Context<any>;
    CommandConstructors: T[];
    useCaseFactories: P[];
    duplicateChecker: DuplicateChecker;
}

export class UseCaseBinder<Command, P extends Factory<UseCase, any>> {
    private context: Context<any>;
    private CommandConstructors: Construct<Command>[] = [];
    private useCaseFactories: P[] = [];
    private duplicateChecker: DuplicateChecker;

    // If true, this binder should not use
    private hasDelegateNewBiding = false;

    constructor(args: UseCaseBinderArgs<Construct<Command>, P>) {
        this.context = args.context;
        this.CommandConstructors = args.CommandConstructors;
        this.useCaseFactories = args.useCaseFactories;
        this.duplicateChecker = args.duplicateChecker;
    }

    /**
     * Bind the `CommandConstructor` to `useCase` instance.
     */
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
        this.releaseBinding();
        return new UseCaseBinder({
            context: this.context,
            CommandConstructors: [...this.CommandConstructors, CommandConstructor],
            useCaseFactories: [...this.useCaseFactories, () => useCase],
            duplicateChecker: this.duplicateChecker
        });
    }

    /**
     * Bind the `CommandConstructor` to `useCaseFactory`.
     * `useCaseFactory` is factory function to create a UseCase instance.
     */
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
        this.releaseBinding();
        return new UseCaseBinder({
            context: this.context,
            CommandConstructors: [...this.CommandConstructors, CommandConstructor],
            useCaseFactories: [...this.useCaseFactories, useCaseFactory],
            duplicateChecker: this.duplicateChecker
        });
    }

    send(command: Command) {
        if (this.hasDelegateNewBiding) {
            throw new Error(`You should use last return value of bind/bindFactory to send a Command.
NG:

const container = UseCaseContainer.create(context);
// You should use the return value of bnd
container.bind(CommandA, new UseCaseA())
         .bind(CommandB, new UseCaseB());   
// this container is already released
container.send(CommandA);
    
OK:

const container = UseCaseContainer
     .create(context)
     .bind(CommandA, new UseCaseA())
     .bind(CommandB, new UseCaseB());   
container.send(CommandA);
`);
        }
        const CommandConstructor = (command as any).constructor;
        if (!CommandConstructor) {
            throw new Error(`This command should be instance of Command: ${command}`);
        }
        const index = this.CommandConstructors.indexOf(CommandConstructor);
        if (index === -1) {
            throw new Error(`This command have not mapped any UseCase: ${command}`);
        }
        const useCaseFactory = this.useCaseFactories[index];
        if (!useCaseFactory) {
            throw new Error(`UseCase is not found for the command: ${command}`);
        }
        const useCase = useCaseFactory(command);
        return this.context.useCase(useCase).executor(useCase => useCase.execute(command));
    }

    private releaseBinding() {
        this.hasDelegateNewBiding = true;
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
 * const container = UseCaseCommandBus
 *      .create(context)
 *      .bind(CommandA, new UseCaseA())
 *      .bind(CommandB, new UseCaseB());
 * container.send(new TestCommandA())
 *   .then(() => {})
 *   .catch(error => {});
 * ```
 *
 *
 */
export class UseCaseCommandBus {
    static create(context: Context<any>) {
        const duplicateChecker = new DuplicateChecker();
        return new UseCaseBinder({
            context,
            duplicateChecker,
            CommandConstructors: [],
            useCaseFactories: []
        });
    }
}
