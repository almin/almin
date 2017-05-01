import { Context, Store, Dispatcher, UseCase, StoreGroup } from "../../src/index";
// Dispatcher
const dispatcher = new Dispatcher();
class AStore extends Store {
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
class BStore extends Store {
    constructor() {
        super();
        this.state = {
            b: 2
        };
    }
    receivePayload(_payload) {
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
    store: storeGroup
});
// Context - life cycle
context.onWillExecuteEachUseCase((payload, meta) => {
    console.log(payload.args, meta);
});
context.onDidExecuteEachUseCase((payload, meta) => {
    console.log(payload.value, meta);
});
context.onCompleteEachUseCase((payload, meta) => {
    console.log(payload.value, meta);
});
context.onErrorDispatch((payload, meta) => {
    console.log(payload.error, meta);
});
context.onDispatch((payload, meta) => {
    console.log(payload.type, meta);
});
// UseCase
class ChildUseCase extends UseCase {
    execute(value) {
        this.dispatch({
            type: "ChildUseCase",
            value
        });
    }
}
class ParentUseCase extends UseCase {
    execute(value) {
        // TODO: improve `execute` signature - https://github.com/almin/almin/issues/107
        return this.context.useCase(new ChildUseCase()).execute(value);
    }
}
const parentUseCase = new ParentUseCase();
const functionalUseCase = (context) => {
    return (value) => {
        context.dispatcher.dispatch({
            type: value
        });
    };
};
// execute - functional execute with ArgT
context.useCase(functionalUseCase).execute("1").then(() => {
    const state = context.getState();
    console.log(state.aState.a);
    console.log(state.bState.b);
});
// execute - functional execute without ArgT
context.useCase(functionalUseCase).execute("value").then(() => {
    // nope
});
// execute: usecase with T
context.useCase(parentUseCase).execute("value").then(() => {
    const state = context.getState();
    console.log(state.aState.a);
    console.log(state.bState.b);
}).catch((error) => {
    console.error(error);
});
// execute - usecase without T
context.useCase(parentUseCase).execute("value").then(() => {
    // nope
});
