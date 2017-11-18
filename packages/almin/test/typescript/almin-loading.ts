// Loading UseCase & Store Example
import { Context, Store, Dispatcher, UseCase, Payload } from "../../src/index";

// custom payload
class LoadingPayload extends Payload {
    type = "MyPayload";

    constructor(public isLoading: boolean) {
        super();
    }
}

type UpdateLoadingUseCaseArg = boolean;

class UpdateLoadingUseCase extends UseCase {
    execute(isLoading: UpdateLoadingUseCaseArg) {
        this.dispatch(new LoadingPayload(isLoading));
    }
}

class LoadingState {
    constructor(public isLoading: boolean) {}

    update(isLoading: boolean) {
        return new LoadingState(isLoading);
    }
}

class LoadingStore extends Store<LoadingState> {
    state: LoadingState;

    constructor() {
        super();
        this.state = new LoadingState(false);
    }

    receivePayload(payload: LoadingPayload | any) {
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
context
    .useCase(loadingUseCase)
    .execute<UpdateLoadingUseCaseArg>(true)
    .then(() => {
        // nope
    });
