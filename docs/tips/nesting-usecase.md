# Nesting UseCase

`UseCase` can be nesting.
It means that some UseCase `execute` other UseCase.
 
`UseCase` instance has `this.context` object that is same with `Context` instance.
 
For example, AUseCase -> BUseCase.
 
```js 
class BUseCase extends UseCase {
 execute() {
 }
}
class AUseCase extends UseCase {
 execute() {
     const bUseCase = new BUseCase();
     const useCaseContext = this.context;
     useCaseContext.useCase(bUseCase).execute();
 }
}
const aUseCase = new AUseCase();
const bUseCase = new BUseCase();
const callStack = [];
const expectedCallStackOfAUseCase = [
 `ON_WILL_EXECUTE_EACH_USECASE`,
 `ON_DID_EXECUTE_EACH_USECASE`
];
const expectedCallStack = [
 `${aUseCase.name}:will`,
 `${bUseCase.name}:will`,
 `${bUseCase.name}:did`,
 `${aUseCase.name}:did`
];
const dispatcher = new Dispatcher();
const context = new Context({
 dispatcher,
 store: new Store()
});
context.onWillExecuteEachUseCase(useCase => {
 callStack.push(`${useCase.name}:will`);
});
context.onDidExecuteEachUseCase(useCase => {
 callStack.push(`${useCase.name}:did`);
});
// 
context.useCase(aUseCase).execute().then(() => {
 assert.deepEqual(callStack, expectedCallStack);
});
```

It is useful for transaction of application or Toggle UseCase(Play/PauseUseCase) etc...