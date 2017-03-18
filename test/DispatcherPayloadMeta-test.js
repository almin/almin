// MIT © 2017 azu
"use strict";
const assert = require("assert");
import { Context } from "../lib/Context";
import { Dispatcher } from "../lib/Dispatcher";
import { Store } from "../lib/Store";
import { NoDispatchUseCase } from "./use-case/NoDispatchUseCase";
import { DispatchUseCase } from "./use-case/DispatchUseCase";
import { ErrorUseCase } from "./use-case/ErrorUseCase";
import { ParentUseCase, ChildUseCase } from "./use-case/NestingUseCase";
describe("DispatcherPayloadMeta", () => {
    context("onWillExecuteEachUseCase", () => {
        it("meta has {useCase, dispatcher, timeStamp}", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher: dispatcher,
                store: new Store()
            });
            const useCase = new NoDispatchUseCase();
            let actualMeta = null;
            context.onWillExecuteEachUseCase((payload, meta) => {
                actualMeta = meta;
            });
            return context.useCase(useCase).execute().then(() => {
                assert(actualMeta.useCase === useCase);
                assert(actualMeta._dispatcher === dispatcher);
                assert(actualMeta.parentUseCase === null);
                assert(typeof actualMeta.timeStamp === "number");
            });
        });
    });
    context("onDispatch", () => {
        it("meta has {dispatcher, timeStamp}", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher: dispatcher,
                store: new Store()
            });
            const useCase = new DispatchUseCase();
            let actualMeta = null;
            context.onDispatch((payload, meta) => {
                actualMeta = meta;
            });
            return context.useCase(useCase).execute({type: "test"}).then(() => {
                assert(actualMeta.useCase === useCase);
                assert(actualMeta._dispatcher === useCase);
                assert(actualMeta.parentUseCase === null);
                assert(typeof actualMeta.timeStamp === "number");
            });
        });
    });
    context("onDidExecuteEachUseCase", () => {
        it("meta has {useCase, dispatcher, timeStamp}", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher: dispatcher,
                store: new Store()
            });
            const useCase = new NoDispatchUseCase();
            let actualMeta = null;
            context.onDidExecuteEachUseCase((payload, meta) => {
                actualMeta = meta;
            });
            return context.useCase(useCase).execute().then(() => {
                assert(actualMeta.useCase === useCase);
                assert(actualMeta._dispatcher === dispatcher);
                assert(actualMeta.parentUseCase === null);
                assert(typeof actualMeta.timeStamp === "number");
            });
        });
    });
    context("onCompleteEachUseCase", () => {
        it("meta has {useCase, dispatcher, timeStamp}", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher: dispatcher,
                store: new Store()
            });
            const useCase = new NoDispatchUseCase();
            let actualMeta = null;
            context.onCompleteEachUseCase((payload, meta) => {
                actualMeta = meta;
            });
            return context.useCase(useCase).execute().then(() => {
                assert(actualMeta.useCase === useCase);
                assert(actualMeta._dispatcher === dispatcher);
                assert(actualMeta.parentUseCase === null);
                assert(typeof actualMeta.timeStamp === "number");
            });
        });
    });
    context("onErrorDispatch", () => {
        it("meta has {useCase, dispatcher, timeStamp}", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher: dispatcher,
                store: new Store()
            });
            const useCase = new ErrorUseCase();
            let actualMeta = null;
            context.onCompleteEachUseCase((payload, meta) => {
                actualMeta = meta;
            });
            return context.useCase(useCase).execute().catch(() => {
                assert(actualMeta.useCase === useCase);
                assert(actualMeta._dispatcher === dispatcher);
                assert(actualMeta.parentUseCase === null);
                assert(typeof actualMeta.timeStamp === "number");
            });
        });
    });
    // specific case
    context("when nesting useCase", () => {
        it("will/did/complete's meta has {useCase, dispatcher, parentUseCase, timeStamp}", () => {
            const dispatcher = new Dispatcher();
            const context = new Context({
                dispatcher: dispatcher,
                store: new Store()
            });
            const parentUseCase = new ParentUseCase();
            const childUseCase = parentUseCase.childUseCase;
            let willMeta = [];
            let didMeta = [];
            let completeMeta = [];
            let childDispatchMeta = null;
            context.onWillExecuteEachUseCase((payload, meta) => willMeta.push(meta));
            context.onDidExecuteEachUseCase((payload, meta) => didMeta.push(meta));
            context.onCompleteEachUseCase((payload, meta) => completeMeta.push(meta));
            context.onDispatch((payload, meta) => childDispatchMeta = meta);
            return context.useCase(parentUseCase).execute().then(() => {
                const [parentWillMeta, childWillMeta] = willMeta;
                const [childDidMeta, parentDidMeta] = didMeta;
                const [childCompleteMeta, parentCompleteMeta] = completeMeta;
                // parent
                assert(parentWillMeta.useCase === parentUseCase);
                assert(parentWillMeta._dispatcher === dispatcher);
                assert(parentWillMeta.parentUseCase === null);
                assert(typeof parentWillMeta.timeStamp === "number");
                assert(parentDidMeta.useCase === parentUseCase);
                assert(parentDidMeta._dispatcher === dispatcher);
                assert(parentDidMeta.parentUseCase === null);
                assert(typeof parentDidMeta.timeStamp === "number");
                assert(parentCompleteMeta.useCase === parentUseCase);
                assert(parentCompleteMeta._dispatcher === dispatcher);
                assert(parentCompleteMeta.parentUseCase === null);
                assert(typeof parentCompleteMeta.timeStamp === "number");
                // child
                assert(childWillMeta.useCase === childUseCase);
                assert(childWillMeta._dispatcher === parentUseCase);
                assert(childWillMeta.parentUseCase === parentUseCase);
                assert(typeof childWillMeta.timeStamp === "number");
                assert(childDidMeta.useCase === childUseCase);
                assert(childDidMeta._dispatcher === parentUseCase);
                assert(childDidMeta.parentUseCase === parentUseCase);
                assert(typeof childDidMeta.timeStamp === "number");
                assert(childCompleteMeta.useCase === childUseCase);
                assert(childCompleteMeta._dispatcher === parentUseCase);
                assert(childCompleteMeta.parentUseCase === parentUseCase);
                assert(typeof childCompleteMeta.timeStamp === "number");
                // childDispatchMeta
                assert(childDispatchMeta.useCase === childUseCase);
                assert(childDispatchMeta._dispatcher === childUseCase);
                assert(childDispatchMeta.parentUseCase === null);
                assert(typeof childDispatchMeta.timeStamp === "number");
            });
        });
    });
});
