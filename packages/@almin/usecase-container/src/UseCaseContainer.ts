import { UseCase, Context } from "almin";

export type Construct<T> = {
    new (...args: any[]): T;
};

export class UseCaseBinder<P extends UseCase, Command> {
    constructor(
        private context: Context<any>,
        public CommandConstructors: Construct<Command>[] = [],
        public useCases: P[] = []
    ) {}

    bind<V extends UseCase, K extends Construct<Command>>(
        CommandConstructor: K,
        useCase: V
    ): UseCaseBinder<V | P, K | Command> {
        return new UseCaseBinder(
            this.context,
            [...this.CommandConstructors, CommandConstructor],
            [...this.useCases, useCase]
        );
    }

    send(command: Command) {
        const CommandConstructor = (command as any).constructor;
        if (!CommandConstructor) {
            throw new Error(`This command have not .constructor property: ${command}`);
        }
        const useCases: UseCase[] = [];
        this.CommandConstructors.forEach((TargetCommandConstructor, index) => {
            if (CommandConstructor === TargetCommandConstructor) {
                useCases.push(this.useCases[index]);
            }
        });
        if (useCases.length === 0) {
            throw new Error(`This command have not mapped any UseCase: ${command}`);
        }
        const executedPromises = useCases.map(useCase => {
            this.context.useCase(useCase).executor(useCase => useCase.execute(command));
        });
        return Promise.all(executedPromises);
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
 * container.send(new TestCommandA());
 * ```
 *
 *
 */
export class UseCaseContainer {
    static create(context: Context<any>) {
        return {
            bind: function<V extends UseCase, K>(CommandConstructor: Construct<K>, useCase: V): UseCaseBinder<V, K> {
                return new UseCaseBinder(context, [CommandConstructor], [useCase]);
            }
        };
    }
}
