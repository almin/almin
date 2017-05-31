// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { Dispatcher } from "./Dispatcher";
import { UseCase } from "./UseCase";
import { DispatcherPayloadMeta, DispatcherPayloadMetaImpl } from "./DispatcherPayloadMeta";
import { UseCaseInstanceMap } from "./UseCaseInstanceMap";
// payloads
import { CompletedPayload, isCompletedPayload } from "./payload/CompletedPayload";
import { DidExecutedPayload, isDidExecutedPayload } from "./payload/DidExecutedPayload";
import { WillExecutedPayload, isWillExecutedPayload } from "./payload/WillExecutedPayload";
import { UseCaseLike } from "./UseCaseLike";
import { Payload } from "./payload/Payload";


interface onWillExecuteArgs {
    (...args: Array<any>): void;
}

interface onDidExecuteArgs {
    (value?: any): void;
}

interface onCompleteArgs {
    (value?: any): void;
}

/**
 * Create wrapper object of a UseCase.
 * This wrapper object only has `execute()` method.
 */
const proxifyUseCase = <T extends UseCaseLike>(useCase: T, onWillExecute: onWillExecuteArgs, onDidExecute: onDidExecuteArgs, onComplete: onCompleteArgs): T => {
    let isExecuted = false;
    const execute = (...args: Array<any>) => {
        if (process.env.NODE_ENV !== "production") {
            if (isExecuted) {
                console.error(`Warning(UseCase): ${useCase.name}#execute was called more than once.`);
            }
        }
        isExecuted = true;
        // before execute
        onWillExecute(args);
        // execute
        const result = useCase.execute(...args);
        // after execute
        onDidExecute(result);
        return onComplete(result);
    };
    // Add debug displayName
    if (process.env.NODE_ENV !== "production") {
        (execute as any).displayName = `Wrapped<${useCase.name}>#execute`;
    }
    return {
        execute: execute
    } as T;
};
/**
 * When child is completed after parent did completed, display warning warning message
 * @private
 */
const warningUseCaseIsAlreadyReleased = (parentUseCase: UseCaseLike, useCase: UseCaseLike, payload: Payload, meta: DispatcherPayloadMeta) => {
    console.error(`Warning(UseCase): ${useCase.name}'s parent UseCase(${parentUseCase.name}) is already released.
This UseCase(${useCase.name}) will not work correctly.
https://almin.js.org/docs/warnings/usecase-is-already-released.html
`, payload, meta);
};

/**
 * `UseCaseExecutor` is a helper class for executing UseCase.
 *
 * You can not create the instance of UseCaseExecutor directory.
 * You can get the instance by `Context#useCase(useCase)`,
 *
 * @private
 */
export class UseCaseExecutor<T extends UseCaseLike> {

    /**
     * A executable useCase
     */
    private _useCase: T;

    /**
     * A parent useCase
     */
    private _parentUseCase: UseCase | null;

    /**
     * A dispatcher instance
     */
    private _dispatcher: Dispatcher;

    /**
     * callable release handlers that are called in release()
     */
    private _releaseHandlers: Array<() => void>;

    /**
     * @param   useCase
     * @param   parent
     *      parent is parent of `useCase`
     * @param   dispatcher
     * @public
     *
     * **internal** documentation
     */
    constructor({
                    useCase,
                    parent,
                    dispatcher
                }: {
        useCase: T;
        parent: UseCase | null;
        dispatcher: Dispatcher;
    }) {
        if (process.env.NODE_ENV !== "production") {
            // execute and finish =>
            const useCaseName = useCase.name;
            assert.ok(typeof useCaseName === "string", `UseCase instance should have constructor.name ${useCase}`);
            assert.ok(typeof useCase.execute === "function", `UseCase instance should have #execute function: ${useCaseName}`);
        }

        this._useCase = useCase;
        this._parentUseCase = parent;
        this._dispatcher = dispatcher;
        this._releaseHandlers = [];
        // delegate userCase#onDispatch to central dispatcher
        const unListenHandler = this._useCase.pipe(this._dispatcher);
        this._releaseHandlers.push(unListenHandler);
    }

    /**
     * @param   [args] arguments of the UseCase
     */
    private _willExecute(args?: any[]): void {
        // Add instance to manager
        // It should be removed when it will be completed.
        UseCaseInstanceMap.set(this._useCase, this);
        const payload = new WillExecutedPayload({
            args
        });
        const meta = new DispatcherPayloadMetaImpl({
            useCase: this._useCase,
            dispatcher: this._dispatcher,
            parentUseCase: this._parentUseCase,
            isTrusted: true,
            isUseCaseFinished: false
        });
        this._dispatcher.dispatch(payload, meta);
        // Warning: parentUseCase is already released
        if (process.env.NODE_ENV !== "production") {
            if (this._parentUseCase && !UseCaseInstanceMap.has(this._parentUseCase)) {
                warningUseCaseIsAlreadyReleased(this._parentUseCase, this._useCase, payload, meta);
            }
        }
    }

    /**
     * dispatch did execute each UseCase
     */
    private _didExecute(value?: any): void {
        // if the UseCase return a promise, almin recognize the UseCase as continuous.
        // In other word, If the UseCase want to continue, please return a promise object.
        const isResultPromise = typeof value === "object" && value !== null && typeof value.then == "function";
        const isUseCaseFinished = !isResultPromise;
        const payload = new DidExecutedPayload({
            value
        });
        const meta = new DispatcherPayloadMetaImpl({
            useCase: this._useCase,
            dispatcher: this._dispatcher,
            parentUseCase: this._parentUseCase,
            isTrusted: true,
            isUseCaseFinished
        });
        this._dispatcher.dispatch(payload, meta);
    }

    /**
     * dispatch complete each UseCase
     * @param   [value] unwrapped result value of the useCase executed
     */
    private _complete(value?: any): void {
        const payload = new CompletedPayload({
            value
        });
        const meta = new DispatcherPayloadMetaImpl({
            useCase: this._useCase,
            dispatcher: this._dispatcher,
            parentUseCase: this._parentUseCase,
            isTrusted: true,
            isUseCaseFinished: true
        });
        this._dispatcher.dispatch(payload, meta);
        // Warning: parentUseCase is already released
        if (process.env.NODE_ENV !== "production") {
            if (this._parentUseCase && !UseCaseInstanceMap.has(this._parentUseCase)) {
                warningUseCaseIsAlreadyReleased(this._parentUseCase, this._useCase, payload, meta);
            }
        }
        // Delete the reference from instance manager
        // It prevent leaking of instance.
        UseCaseInstanceMap.delete(this._useCase);
    }

    /**
     * called the {@link handler} with useCase when the useCase will do.
     * @param   handler
     */
    onWillExecuteEachUseCase(handler: (payload: WillExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        const releaseHandler = this._dispatcher.onDispatch(function onWillExecute(payload, meta) {
            if (isWillExecutedPayload(payload)) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * called the `handler` with useCase when the useCase is executed.
     * @param   handler
     */
    onDidExecuteEachUseCase(handler: (payload: DidExecutedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        const releaseHandler = this._dispatcher.onDispatch(function onDidExecuted(payload, meta) {
            if (isDidExecutedPayload(payload)) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * called the `handler` with useCase when the useCase is completed.
     * @param   handler
     * @returns
     */
    onCompleteExecuteEachUseCase(handler: (payload: CompletedPayload, meta: DispatcherPayloadMeta) => void): () => void {
        const releaseHandler = this._dispatcher.onDispatch(function onCompleted(payload, meta) {
            if (isCompletedPayload(payload)) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * Similar to `execute(arguments)`, but it accept an executor function insteadof `arguments`
     *
     * `executor(useCase => useCase.execute())` return a Promise object that resolved with undefined.
     *
     * ## Example
     *
     * ```js
     * context.useCase(new MyUseCase())
     *  .executor(useCase => useCase.execute("value"))
     *  .then(() => {
     *    console.log("test");
     *  });
     * ```
     *
     * ## Notes
     *
     * ### What is difference between `executor(executor)` and `execute(arguments)`?
     *
     * The `execute(arguments)` is a alias of following codes:
     *
     * ```js
     * context.useCase(new MyUseCase())
     *  .execute("value")
     * // ===
     * context.useCase(new MyUseCase())
     *  .executor(useCase => useCase.execute("value"))
     * ```
     *
     * ### Why executor's result always undefined?
     *
     * UseCaseExecutor always resolve `undefined` data by design.
     * In CQRS, the command always have a void return type.
     *
     * - http://cqrs.nu/Faq
     *
     * So, Almin return only command result that is success or failure.
     * You should not relay on the data of the command result.
     */
    executor(executor: (useCase: Pick<T, "execute">) => any): any {
        const startingExecutor = (resolve: Function, reject: Function): void => {
            if (typeof executor !== "function") {
                console.error("Warning(UseCase): executor argument should be function. But this argument is not function: ", executor);
                return reject(new Error("executor(fn) arguments should function"));
            }
            // Notes: proxyfiedUseCase has not timeout
            // proxiedUseCase will resolve by UseCaseWrapper#execute
            const proxyfiedUseCase = proxifyUseCase<T>(this._useCase, (args) => {
                this._willExecute(args);
            }, (value) => {
                this._didExecute(value);
            }, (value) => {
                resolve(value);
            });
            return executor(proxyfiedUseCase);
        };
        return new Promise(startingExecutor).then(result => {
            this._complete(result);
            this.release();
        }).catch(error => {
            this._useCase.throwError(error);
            this._complete();
            this.release();
            return Promise.reject(error);
        });
    }

    /**
     * execute UseCase instance.
     * UseCase is a executable object. it means that has `execute` method.
     * Notes: UseCaseExecutor doesn't return resolved value by design
     */
    execute(): Promise<void>;
    execute<T>(args: T): Promise<void>;
    execute(...args: Array<any>): Promise<void> {
        return this.executor((useCase) => useCase.execute(...args));
    }

    /**
     * release all events handler.
     * You can call this when no more call event handler
     */
    release(): void {
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
    }
}
