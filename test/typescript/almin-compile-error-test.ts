import {
    Context,
    Store,
    StoreGroup,
    Dispatcher,
    UseCase,
    Payload,
    WillExecutedPayload,
    DidExecutedPayload,
    CompletedPayload,
    ErrorPayload,
    DispatcherPayloadMeta,
} from "../../src/index";
// Dispatcher
const dispatcher = new Dispatcher();
class MyStore extends Store {

}
const context = new Context({
    dispatcher,
    store: new MyStore()
});
class ParentUseCase extends UseCase {
    execute(value: string) {
        console.log(value);
    }
}
const parentUseCase = new ParentUseCase();
// execute: usecase
context.useCase(parentUseCase).execute(1).then(() => {
}).catch((error: Error) => {
    console.error(error);
});
