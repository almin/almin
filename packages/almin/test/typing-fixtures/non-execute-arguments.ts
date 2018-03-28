import { UseCase, Context } from "../../src/index";
import { createStore } from "../helper/create-new-store";
class MyUseCase extends UseCase {
    execute() {}
}

const context = new Context({
    store: createStore({ name: "test" })
});

context.useCase(new MyUseCase()).execute();
