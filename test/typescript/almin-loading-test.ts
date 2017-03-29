// Loading UseCase & Store Example
import {
    Context,
    Store,
    Dispatcher,
    UseCase,
    Payload
} from "../../src/index";
// custom payload
class LoadingPayload extends Payload {
    constructor(public isLoading: boolean) {
        super({ type: "MyPayload" });
    }
}
type UpdateLoadingUseCaseArg = boolean;
class UpdateLoadingUseCase extends UseCase {
    execute(isLoading: UpdateLoadingUseCaseArg) {
        this.dispatch(new LoadingPayload(isLoading));
    }
}
class LoadingState {
    constructor(public isLoading: boolean) {
    }
    update(isLoading: boolean) {
        return new LoadingState(isLoading);
    }
}
class LoadingStore extends Store {
    state: LoadingState;
    constructor() {
        super();
        this.state = new LoadingState(false);
        this.onDispatch((payload: LoadingPayload | Payload) => {
            if (payload instanceof LoadingPayload) {
                const newState = this.state.update(payload.isLoading)
                this.state = newState;
            }
        })
    }
}

const loadingUseCase = new UpdateLoadingUseCase();
const loadingStore = new LoadingStore();
const dispatcher = new Dispatcher();
const context = new Context({
    dispatcher,
    store: loadingStore
});
context.useCase<UpdateLoadingUseCaseArg>(loadingUseCase).execute(true);
