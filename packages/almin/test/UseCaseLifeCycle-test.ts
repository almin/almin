/*
LifeCycle method order of call.

| UseCase Type         | Will | Did  | Error | Complete | Return Promise                      |
| -------------------- | ---- | ---- | ----- | -------- | ----------------------------------- |
| Sync Success         | 1    | 2    | --    | 3        | resolve(then)                       |
| Async Success        | 1    | 2    | --    | 3        | resolve(then)                       |
| Sync Failure         | 1    | 3    | 2     | 4        | reject(catch)                       |
| Async Failure        | 1    | 2    | 3     | 4        | reject(catch)                       |
| ShouldExecute: false | --   | --   | --    | --       | resolve(then) - prevent memory leak |

 */
import * as assert from "assert";
import { Context, Dispatcher } from "../src";
import { createStore } from "./helper/create-new-store";
import { NotExecuteUseCase } from "./use-case/NotExecuteUseCase";
import { SyncNoDispatchUseCase } from "./use-case/SyncNoDispatchUseCase";
import { AsyncUseCase } from "./use-case/AsyncUseCase";
import { AsyncErrorUseCase } from "./use-case/AsyncErrorUseCase";
import { ThrowUseCase } from "./use-case/ThrowUseCase";

enum EventType {
    WillNot = "WillNot",
    Will = "Will",
    Did = "Did",
    Error = "Error",
    Complete = "Complete"
}

const shouldNotCalled = () => {
    throw new Error("This should not be called");
};
const createLogger = (context: Context<any>) => {
    const eventLog: EventType[] = [];
    context.events.onWillNotExecuteEachUseCase(() => {
        eventLog.push(EventType.WillNot);
    });
    context.events.onWillExecuteEachUseCase(() => {
        eventLog.push(EventType.Will);
    });
    context.events.onDidExecuteEachUseCase(() => {
        eventLog.push(EventType.Did);
    });
    context.events.onErrorDispatch(() => {
        eventLog.push(EventType.Error);
    });
    context.events.onCompleteEachUseCase(() => {
        eventLog.push(EventType.Complete);
    });
    return {
        getLog() {
            return eventLog;
        }
    };
};
describe("UseCaseLifeCycle", () => {
    it("Sync Success", () => {
        const context = new Context({
            dispatcher: new Dispatcher(),
            store: createStore({ name: "test" })
        });
        const logger = createLogger(context);
        return context
            .useCase(new SyncNoDispatchUseCase())
            .execute()
            .then(() => {
                assert.deepEqual(logger.getLog(), [EventType.Will, EventType.Did, EventType.Complete]);
            }, shouldNotCalled);
    });
    it("ASync Success", () => {
        const context = new Context({
            dispatcher: new Dispatcher(),
            store: createStore({ name: "test" })
        });
        const logger = createLogger(context);
        return context
            .useCase(new AsyncUseCase())
            .execute()
            .then(() => {
                assert.deepEqual(logger.getLog(), [EventType.Will, EventType.Did, EventType.Complete]);
            }, shouldNotCalled);
    });
    it("Sync Failure", () => {
        const context = new Context({
            dispatcher: new Dispatcher(),
            store: createStore({ name: "test" })
        });
        const logger = createLogger(context);
        return context
            .useCase(new ThrowUseCase())
            .execute()
            .then(shouldNotCalled, () => {
                assert.deepEqual(logger.getLog(), [EventType.Will, EventType.Error, EventType.Did, EventType.Complete]);
            });
    });
    it("ASync Failure", () => {
        const context = new Context({
            dispatcher: new Dispatcher(),
            store: createStore({ name: "test" })
        });
        const logger = createLogger(context);
        return context
            .useCase(new AsyncErrorUseCase())
            .execute()
            .then(shouldNotCalled, () => {
                assert.deepEqual(logger.getLog(), [EventType.Will, EventType.Did, EventType.Error, EventType.Complete]);
            });
    });
    it("ShouldExecute() => false", () => {
        const context = new Context({
            dispatcher: new Dispatcher(),
            store: createStore({ name: "test" })
        });
        const logger = createLogger(context);
        return context
            .useCase(new NotExecuteUseCase())
            .execute()
            .then(() => {
                assert.deepEqual(logger.getLog(), [EventType.WillNot]);
            }, shouldNotCalled);
    });
});
