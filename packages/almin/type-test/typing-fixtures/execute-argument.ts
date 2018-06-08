import { UseCase, Context, Store } from "../../src";

class MyStore extends Store<{}> {
    constructor(args: { name: string }) {
        super();
        this.name = args.name;
    }
    getState() {
        return {};
    }
}

class MyUseCaseNoArgument extends UseCase {
    execute() {}
}

class MyUseCaseA extends UseCase {
    execute(_a: string) {}
}

class MyUseCaseB extends UseCase {
    execute(_a: string, _b: number) {}
}

class MyUseCaseObj extends UseCase {
    execute(_args: { a: string; b: number }) {}
}

class MyUseCaseOptional extends UseCase {
    execute(_value?: string) {}
}

class MyUseCaseDefault extends UseCase {
    execute(_value: string = "string") {}
}

const context = new Context({
    store: new MyStore({ name: "test" })
});

// valid
context.useCase(new MyUseCaseNoArgument()).execute();
context.useCase(new MyUseCaseA()).execute("A");
context.useCase(new MyUseCaseB()).execute("B", 2);
context.useCase(new MyUseCaseObj()).execute({ a: "A", b: 2 });
context.useCase(new MyUseCaseOptional()).execute();
context.useCase(new MyUseCaseOptional()).execute("string");
context.useCase(new MyUseCaseDefault()).execute();
context.useCase(new MyUseCaseDefault()).execute("string");
// invalid
// typings:expect-error
context.useCase(new MyUseCaseA()).execute();
// typings:expect-error
context.useCase(new MyUseCaseA()).execute(1);
// typings:expect-error
context.useCase(new MyUseCaseA()).execute(1, 2);
// typings:expect-error
context.useCase(new MyUseCaseA()).execute({ key: "value" });
// typings:expect-error
context.useCase(new MyUseCaseB()).execute(1, 2);
// typings:expect-error
context.useCase(new MyUseCaseObj()).execute({ a: 1, b: 2 });
// typings:expect-error
context.useCase(new MyUseCaseOptional()).execute(1, 1);
// typings:expect-error
context.useCase(new MyUseCaseDefault()).execute(1);

// =====
// FIXME: These are should be Error, but current not support
// =====
// more arguments

context.useCase(new MyUseCaseA()).execute("A", 1, 1);
// typings:expect-error
context.useCase(new MyUseCaseA()).executor(useCase => useCase.execute("A", 1, 1));
