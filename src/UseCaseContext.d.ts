import Dispatcher from "./Dispatcher";

type UseCase = any; // FIXME
type UseCaseExecutor = any; // FIXME

export default class UseCaseContext {

    dispatcher: Dispatcher | UseCase;
    constructor(dispatcher: Dispatcher | UseCase);
    useCase(useCase: UseCase): UseCaseExecutor;
}