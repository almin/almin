import {
    Context,
    Store,
    Dispatcher,
    UseCase,
    Payload,
    WillExecutedPayload,
    DidExecutedPayload,
    CompletedPayload,
    ErrorPayload,
    DispatcherPayloadMeta,
    FunctionalUseCaseContext,
    StoreGroup
} from "../../src/index";
// Dispatcher
const dispatcher = new Dispatcher();

// Store
interface AState {
    a: number;
}

class AStore extends Store<AState> {
    state: AState;

    constructor() {
        super();
        this.state = {
            a: 1
        };
    }

    getState() {
        return this.state;
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
        };
    }

    receivePayload(_payload: Payload) {
        this.setState({
            b: 1
        });
    }

    getState() {
        return this.state;
    }
}

// Type hacking
const storeGroup = new StoreGroup({
    aState: new AStore(),
    bState: new BStore()
});
// Context
const context = new Context({
    dispatcher,
    store: storeGroup,
    options: {
        strict: true
    }
});

const log = (..._messages: any[]) => {
    // nope
};
// Context - life cycle
context.events.onWillExecuteEachUseCase((payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => {
    log(payload.args, meta);
});
context.events.onDidExecuteEachUseCase((payload: DidExecutedPayload, meta: DispatcherPayloadMeta) => {
    log(payload.value, meta);
});
context.events.onCompleteEachUseCase((payload: CompletedPayload, meta: DispatcherPayloadMeta) => {
    log(payload.value, meta);
});
context.events.onErrorDispatch((payload: ErrorPayload, meta: DispatcherPayloadMeta) => {
    log(payload.error, meta);
});
context.events.onDispatch((payload: Payload, meta: DispatcherPayloadMeta) => {
    log(payload.type, meta);
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
    };
};
// execute - functional execute with ArgT
context
    .useCase(functionalUseCase)
    .execute<functionUseCaseArgs>("1")
    .then(() => {
        const state = context.getState();
        log(state.aState.a);
        log(state.bState.b);
    });
// execute - functional execute without ArgT
context
    .useCase(functionalUseCase)
    .execute("value")
    .then(() => {
        // nope
    });

// execute: usecase with T
context
    .useCase(parentUseCase)
    .execute<ParentUseCaseArgs>("value")
    .then(() => {
        const state = context.getState();
        log(state.aState.a);
        log(state.bState.b);
    })
    .catch((error: Error) => {
        console.error(error);
    });
// execute - usecase without T
context
    .useCase(parentUseCase)
    .execute("value")
    .then(() => {
        // nope
    });

// executor

class MyUseCase extends UseCase {
    execute(value: string) {
        this.dispatch({
            type: "ChildUseCase",
            value
        });
    }
}

context
    .useCase(new MyUseCase())
    .executor(useCase => useCase.execute("value"))
    .then(() => {
        log("finish");
    });

context
    .transaction("my work", async transactionContext => {
        await transactionContext.useCase(new MyUseCase()).execute();
        await transactionContext.useCase(new ParentUseCase()).execute();
        transactionContext.commit();
    })
    .then(() => {
        log("Finish");
    });
