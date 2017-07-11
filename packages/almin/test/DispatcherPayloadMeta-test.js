// MIT © 2017 azu
"use strict";
const assert = require("assert");
import { Store, Context, DidExecutedPayload, CompletedPayload } from "../lib/";
import MapLike from "map-like";
import ReturnPromiseUseCase from "./use-case/ReturnPromiseUseCase";
import { Dispatcher } from "../lib/Dispatcher";
import { NoDispatchUseCase } from "./use-case/NoDispatchUseCase";
import { DispatchUseCase } from "./use-case/DispatchUseCase";
import { ErrorUseCase } from "./use-case/ErrorUseCase";
import { ParentUseCase, ChildUseCase } from "./use-case/NestingUseCase";
import { createStore } from "./helper/create-new-store";
describe("DispatcherPayloadMeta", () => {
    context("onWillExecuteEachUseCase", () => {
        it("meta has {useCase, dispatcher, timeStamp}", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const useCase = new NoDispatchUseCase();
            let actualMeta = null;
            context.onWillExecuteEachUseCase((payload, meta) => {
                actualMeta = meta;
            });
            return context.useCase(useCase).execute().then(() => {
                assert(actualMeta.useCase === useCase);
                assert(actualMeta.dispatcher === dispatcher);
                assert(actualMeta.parentUseCase === null);
                assert(typeof actualMeta.timeStamp === "number");
            });
        });
    });
    context("onDispatch", () => {
        it("meta has {dispatcher, timeStamp}", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const useCase = new DispatchUseCase();
            let actualMeta = null;
            context.onDispatch((payload, meta) => {
                actualMeta = meta;
            });
            return context.useCase(useCase).execute({ type: "test" }).then(() => {
                assert(actualMeta.useCase === useCase);
                assert(actualMeta.dispatcher === useCase);
                assert(actualMeta.parentUseCase === null);
                assert(typeof actualMeta.timeStamp === "number");
            });
        });
    });
    context("onDidExecuteEachUseCase", () => {
        it("DispatchUseCase's meta has {useCase, dispatcher, timeStamp} and isUseCaseFinished=true", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const useCase = new NoDispatchUseCase();
            let actualMeta = null;
            context.onDidExecuteEachUseCase((payload, meta) => {
                actualMeta = meta;
            });
            return context.useCase(useCase).execute().then(() => {
                assert(actualMeta.useCase === useCase);
                assert(actualMeta.dispatcher === dispatcher);
                assert(actualMeta.parentUseCase === null);
                assert(actualMeta.isUseCaseFinished === true);
                assert(typeof actualMeta.timeStamp === "number");
            });
        });
        it("ReturnPromiseUseCase's meta has {useCase, dispatcher, timeStamp} and isUseCaseFinished=false", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const useCase = new ReturnPromiseUseCase();
            let actualMeta = null;
            context.onDidExecuteEachUseCase((payload, meta) => {
                actualMeta = meta;
            });
            return context.useCase(useCase).execute().then(() => {
                assert(actualMeta.useCase === useCase);
                assert(actualMeta.dispatcher === dispatcher);
                assert(actualMeta.parentUseCase === null);
                assert(actualMeta.isUseCaseFinished === false);
                assert(typeof actualMeta.timeStamp === "number");
            });
        });
    });
    context("onCompleteEachUseCase", () => {
        it("meta has {useCase, dispatcher, timeStamp}", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const useCase = new NoDispatchUseCase();
            let actualMeta = null;
            context.onCompleteEachUseCase((payload, meta) => {
                actualMeta = meta;
            });
            return context.useCase(useCase).execute().then(() => {
                assert(actualMeta.useCase === useCase);
                assert(actualMeta.dispatcher === dispatcher);
                assert(actualMeta.parentUseCase === null);
                assert(actualMeta.isUseCaseFinished === true);
                assert(typeof actualMeta.timeStamp === "number");
            });
        });
    });
    context("onErrorDispatch", () => {
        it("meta has {useCase, dispatcher, timeStamp}", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher,
                store: createStore({ name: "test" })
            });
            const useCase = new ErrorUseCase();
            let actualMeta = null;
            context.onErrorDispatch((payload, meta) => {
                actualMeta = meta;
            });
            return context.useCase(useCase).execute().catch(() => {
                assert(actualMeta.useCase === useCase);
                assert(actualMeta.dispatcher === useCase);
                assert(actualMeta.parentUseCase === null);
                assert(actualMeta.isUseCaseFinished === false);
                assert(typeof actualMeta.timeStamp === "number");
            });
        });
    });
    // specific case
    context("when nesting useCase", () => {
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
            context.onWillExecuteEachUseCase((payload, meta) => willMeta.push(meta));
            context.onDidExecuteEachUseCase((payload, meta) => didMeta.push(meta));
            context.onCompleteEachUseCase((payload, meta) => completeMeta.push(meta));
            context.onDispatch((payload, meta) => (childDispatchMeta = meta));
            return context.useCase(parentUseCase).execute().then(() => {
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
    context("Scenario Case", () => {
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
            return context.useCase(useCase).execute({ type: "test" }).then(() => {
                assert.equal(callCount, 1);
            });
        });
    });
});
