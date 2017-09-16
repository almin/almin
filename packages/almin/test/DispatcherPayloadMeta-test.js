// MIT © 2017 azu
"use strict";
const assert = require("assert");
import { MapLike } from "map-like";
import { CompletedPayload, Context, DidExecutedPayload } from "../src/";
import { Dispatcher } from "../src/Dispatcher";
import { createStore } from "./helper/create-new-store";
import { DispatchUseCase } from "./use-case/DispatchUseCase";
import { ErrorUseCase } from "./use-case/ErrorUseCase";
import { ParentUseCase } from "./use-case/NestingUseCase";
import { SyncNoDispatchUseCase } from "./use-case/SyncNoDispatchUseCase";
import { AsyncUseCase } from "./use-case/AsyncUseCase";

describe("DispatcherPayloadMeta", () => {
    describe("onWillExecuteEachUseCase", () => {
        it("meta has {useCase, dispatcher, timeStamp}", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const useCase = new SyncNoDispatchUseCase();
            let actualMeta = null;
            context.events.onWillExecuteEachUseCase((payload, meta) => {
                actualMeta = meta;
            });
            return context
                .useCase(useCase)
                .execute()
                .then(() => {
                    assert(actualMeta.useCase === useCase);
                    assert(actualMeta.dispatcher === dispatcher);
                    assert(actualMeta.parentUseCase === null);
                    assert(actualMeta.transaction === undefined);
                    assert(typeof actualMeta.timeStamp === "number");
                });
        });
    });
    describe("onDispatch", () => {
        it("meta has {dispatcher, timeStamp}", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const useCase = new DispatchUseCase();
            let actualMeta = null;
            context.events.onDispatch((payload, meta) => {
                actualMeta = meta;
            });
            return context
                .useCase(useCase)
                .execute({ type: "test" })
                .then(() => {
                    assert(actualMeta.useCase === useCase);
                    assert(actualMeta.dispatcher === useCase);
                    assert(actualMeta.parentUseCase === null);
                    assert(actualMeta.transaction === undefined);
                    assert(typeof actualMeta.timeStamp === "number");
                });
        });
    });
    describe("onDidExecuteEachUseCase", () => {
        it("DispatchUseCase's meta has {useCase, dispatcher, timeStamp} and isUseCaseFinished=true", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const useCase = new SyncNoDispatchUseCase();
            let actualMeta = null;
            context.events.onDidExecuteEachUseCase((payload, meta) => {
                actualMeta = meta;
            });
            return context
                .useCase(useCase)
                .execute()
                .then(() => {
                    assert(actualMeta.useCase === useCase);
                    assert(actualMeta.dispatcher === dispatcher);
                    assert(actualMeta.parentUseCase === null);
                    assert(actualMeta.isUseCaseFinished === true);
                    assert(actualMeta.transaction === undefined);
                    assert(typeof actualMeta.timeStamp === "number");
                });
        });
        it("ReturnPromiseUseCase's meta has {useCase, dispatcher, timeStamp} and isUseCaseFinished=false", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const useCase = new AsyncUseCase();
            let actualMeta = null;
            context.events.onDidExecuteEachUseCase((payload, meta) => {
                actualMeta = meta;
            });
            return context
                .useCase(useCase)
                .execute()
                .then(() => {
                    assert(actualMeta.useCase === useCase);
                    assert(actualMeta.dispatcher === dispatcher);
                    assert(actualMeta.parentUseCase === null);
                    assert(actualMeta.isUseCaseFinished === false);
                    assert(actualMeta.transaction === undefined);
                    assert(typeof actualMeta.timeStamp === "number");
                });
        });
    });
    describe("onCompleteEachUseCase", () => {
        it("meta has {useCase, dispatcher, timeStamp}", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const useCase = new SyncNoDispatchUseCase();
            let actualMeta = null;
            context.events.onCompleteEachUseCase((payload, meta) => {
                actualMeta = meta;
            });
            return context
                .useCase(useCase)
                .execute()
                .then(() => {
                    assert(actualMeta.useCase === useCase);
                    assert(actualMeta.dispatcher === dispatcher);
                    assert(actualMeta.parentUseCase === null);
                    assert(actualMeta.isUseCaseFinished === true);
                    assert(actualMeta.transaction === undefined);
                    assert(typeof actualMeta.timeStamp === "number");
                });
        });
    });
    describe("onErrorDispatch", () => {
        it("meta has {useCase, dispatcher, timeStamp}", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const useCase = new ErrorUseCase();
            let actualMeta = null;
            context.events.onErrorDispatch((payload, meta) => {
                actualMeta = meta;
            });
            return context
                .useCase(useCase)
                .execute()
                .catch(() => {
                    assert(actualMeta.useCase === useCase);
                    assert(actualMeta.dispatcher === useCase);
                    assert(actualMeta.parentUseCase === null);
                    assert(actualMeta.isUseCaseFinished === false);
                    assert(actualMeta.transaction === undefined);
                    assert(typeof actualMeta.timeStamp === "number");
                });
        });
    });
    // specific case
    describe("when nesting useCase", () => {
        it("will/did/complete's meta has {useCase, dispatcher, parentUseCase, timeStamp}", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const parentUseCase = new ParentUseCase();
            const childUseCase = parentUseCase.childUseCase;
            const willMeta = [];
            const didMeta = [];
            const completeMeta = [];
            let childDispatchMeta = null;
            context.events.onWillExecuteEachUseCase((payload, meta) => willMeta.push(meta));
            context.events.onDidExecuteEachUseCase((payload, meta) => didMeta.push(meta));
            context.events.onCompleteEachUseCase((payload, meta) => completeMeta.push(meta));
            context.events.onDispatch((payload, meta) => (childDispatchMeta = meta));
            return context
                .useCase(parentUseCase)
                .execute()
                .then(() => {
                    const [parentWillMeta, childWillMeta] = willMeta;
                    const [childDidMeta, parentDidMeta] = didMeta;
                    const [childCompleteMeta, parentCompleteMeta] = completeMeta;
                    // parent
                    assert(parentWillMeta.useCase === parentUseCase);
                    assert(parentWillMeta.dispatcher === dispatcher);
                    assert(parentWillMeta.parentUseCase === null);
                    assert(typeof parentWillMeta.timeStamp === "number");
                    assert(parentDidMeta.useCase === parentUseCase);
                    assert(parentDidMeta.dispatcher === dispatcher);
                    assert(parentDidMeta.parentUseCase === null);
                    assert(typeof parentDidMeta.timeStamp === "number");
                    assert(parentCompleteMeta.useCase === parentUseCase);
                    assert(parentCompleteMeta.dispatcher === dispatcher);
                    assert(parentCompleteMeta.parentUseCase === null);
                    assert(typeof parentCompleteMeta.timeStamp === "number");
                    // child
                    assert(childWillMeta.useCase === childUseCase);
                    assert(childWillMeta.dispatcher === parentUseCase);
                    assert(childWillMeta.parentUseCase === parentUseCase);
                    assert(typeof childWillMeta.timeStamp === "number");
                    assert(childDidMeta.useCase === childUseCase);
                    assert(childDidMeta.dispatcher === parentUseCase);
                    assert(childDidMeta.parentUseCase === parentUseCase);
                    assert(typeof childDidMeta.timeStamp === "number");
                    assert(childCompleteMeta.useCase === childUseCase);
                    assert(childCompleteMeta.dispatcher === parentUseCase);
                    assert(childCompleteMeta.parentUseCase === parentUseCase);
                    assert(typeof childCompleteMeta.timeStamp === "number");
                    // childDispatchMeta
                    assert(childDispatchMeta.useCase === childUseCase);
                    assert(childDispatchMeta.dispatcher === childUseCase);
                    assert(childDispatchMeta.parentUseCase === null);
                    assert(typeof childDispatchMeta.timeStamp === "number");
                });
        });
    });
    describe("Scenario Case", () => {
        it("The user can know that the UseCase is just finished by isUseCaseFinished", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const useCase = new DispatchUseCase();
            let callCount = 0;
            const finishedCallback = () => {
                callCount++;
            };
            const calledMap = new MapLike();
            dispatcher.onDispatch((payload, meta) => {
                if (payload instanceof DidExecutedPayload && meta.useCase && meta.isUseCaseFinished) {
                    calledMap.set(meta.useCase.id, true);
                    finishedCallback();
                } else if (payload instanceof CompletedPayload && meta.useCase && meta.isUseCaseFinished) {
                    if (calledMap.has(meta.useCase.id)) {
                        return void calledMap.delete(meta.useCase.id);
                    }
                    finishedCallback();
                }
            });
            return context
                .useCase(useCase)
                .execute({ type: "test" })
                .then(() => {
                    assert.equal(callCount, 1);
                });
        });
    });
});
