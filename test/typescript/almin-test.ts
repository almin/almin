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
    FunctionalUseCaseContext
} from "../../src/index";
// Dispatcher
const dispatcher = new Dispatcher();
// Store
interface AState {
    a: number
}
class AStore extends Store {
    state: AState;

    constructor() {
        super();
        this.state = {
            a: 1
        }
    }

    getState() {
        return {
            A: this.state
        };
    }
}
interface BState {
    b: number;
}
class BStore extends Store {
    state: BState;

    constructor() {
        super();
        this.state = {
            b: 2
        }
    }

    getState() {
        return {
            B: this.state
        };
    }
}
// StoreGroup
interface StoreState {
    A: AState;
    B: BState;
}
const storeGroup = new StoreGroup([
    new AStore(),
    new BStore()
]);
// Context
const context = new Context({
    dispatcher,
    store: storeGroup
});
// Context - life cycle
context.onWillExecuteEachUseCase((payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => {
    console.log(payload.args, meta);
});
context.onDidExecuteEachUseCase((payload: DidExecutedPayload, meta: DispatcherPayloadMeta) => {
    console.log(payload.value, meta);
});
context.onCompleteEachUseCase((payload: CompletedPayload, meta: DispatcherPayloadMeta) => {
    console.log(payload.value, meta);
});
context.onErrorDispatch((payload: ErrorPayload, meta: DispatcherPayloadMeta) => {
    console.log(payload.error, meta);
});
context.onDispatch((payload: Payload, meta: DispatcherPayloadMeta) => {
    console.log(payload.type, meta);
});
// UseCase
class ChildUseCase extends UseCase {
    execute(value: string) {
        this.dispatch({
            type: "ChildUseCase",
            value
        });
    }
}
class ParentUseCase extends UseCase {
    execute(value: string) {
        // TODO: improve `execute` signature - https://github.com/almin/almin/issues/107
        return this.context.useCase(new ChildUseCase()).execute(value);
    }
}
const parentUseCase = new ParentUseCase();
// execute: usecase
context.useCase(parentUseCase).execute(1).then(() => {
    const state = context.getState<StoreState>();
    console.log(state.A.a);
    console.log(state.B.b);
}).catch((error: Error) => {
    console.error(error);
});

context.useCase(parentUseCase).execute("test").then(() => {
    const state = context.getState<StoreState>();
    console.log(state.A.a);
    console.log(state.B.b);
}).catch((error: Error) => {
    console.error(error);
});
