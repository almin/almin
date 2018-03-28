import { UseCase, Context } from "../../src/index";
import { createStore } from "../helper/create-new-store";
class MyUseCase extends UseCase {
    execute(_a1: number, _a2: string) {}
}

const context = new Context({
    store: createStore({ name: "test" })
});

// typings:expect-error
context
    .useCase(new MyUseCase())
    .execute()
    .then(() => {
        // FIXME:
    });
// typings:expect-error
context.useCase(new MyUseCase()).execute(1);
// typings:expect-error
context.useCase(new MyUseCase()).execute(1, 2);
// typings:expect-error
context.useCase(new MyUseCase()).execute("", 2);
// typings:expect-error
context.useCase(new MyUseCase()).execute({ key: "value" });
