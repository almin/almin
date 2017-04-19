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
class AStore extends Store<AState> {
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
class BStore extends Store<BState> {
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
type ParentUseCaseArgs = string;
class ParentUseCase extends UseCase {
    execute(value: ParentUseCaseArgs) {
        // TODO: improve `execute` signature - https://github.com/almin/almin/issues/107
        return this.context.useCase(new ChildUseCase()).execute(value);
    }
}

const parentUseCase = new ParentUseCase();
// functional UseCase
type functionUseCaseArgs = string | undefined;
const functionalUseCase = (context: FunctionalUseCaseContext) => {
    return (value: functionUseCaseArgs) => {
        context.dispatcher.dispatch({
            type: value
        });
    }
};
// execute - functional execute with ArgT
context.useCase(functionalUseCase).execute<functionUseCaseArgs>("1").then(() => {
    const state = context.getState<StoreState>();
    console.log(state.A.a);
    console.log(state.B.b);
});
// execute - functional execute without ArgT
context.useCase(functionalUseCase).execute("value").then(() => {
    // nope
});

// execute: usecase with T
context.useCase(parentUseCase).execute<ParentUseCaseArgs>("value").then(() => {
    const state = context.getState<StoreState>();
    console.log(state.A.a);
    console.log(state.B.b);
}).catch((error: Error) => {
    console.error(error);
});
// execute - usecase without T
context.useCase(parentUseCase).execute("value").then(() => {
    // nope
});
