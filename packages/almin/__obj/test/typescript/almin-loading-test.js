// Loading UseCase & Store Example
import { Context, Store, Dispatcher, UseCase, Payload } from "../../src/index";
// custom payload
class LoadingPayload extends Payload {
    constructor(isLoading) {
        super({ type: "MyPayload" });
        this.isLoading = isLoading;
    }
}
class UpdateLoadingUseCase extends UseCase {
    execute(isLoading) {
        this.dispatch(new LoadingPayload(isLoading));
    }
}
class LoadingState {
    constructor(isLoading) {
        this.isLoading = isLoading;
    }
    update(isLoading) {
        return new LoadingState(isLoading);
    }
}
class LoadingStore extends Store {
    constructor() {
        super();
        this.state = new LoadingState(false);
    }
    receivePayload(payload) {
        if (payload instanceof LoadingPayload) {
            this.state = this.state.update(payload.isLoading);
        }
    }
    getState() {
        return this.state;
    }
}
const loadingUseCase = new UpdateLoadingUseCase();
const loadingStore = new LoadingStore();
const dispatcher = new Dispatcher();
const context = new Context({
    dispatcher,
    store: loadingStore
});
context.useCase(loadingUseCase).execute(true).then(() => {
    // nope
});
