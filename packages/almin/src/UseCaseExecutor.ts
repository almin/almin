// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { Dispatcher } from "./Dispatcher";
import { UseCase } from "./UseCase";
import { DispatcherPayloadMeta, DispatcherPayloadMetaImpl } from "./DispatcherPayloadMeta";
import { UseCaseInstanceMap } from "./UseCaseInstanceMap";
// payloads
import { CompletedPayload } from "./payload/CompletedPayload";
import { DidExecutedPayload } from "./payload/DidExecutedPayload";
import { WillExecutedPayload } from "./payload/WillExecutedPayload";
import { UseCaseLike } from "./UseCaseLike";
import { Payload } from "./payload/Payload";
import { WillNotExecutedPayload } from "./payload/WillNotExecutedPayload";

interface InvalidUsage {
    type: "InvalidUsage";
    error: Error;
}

interface ShouldNotExecute {
    type: "ShouldNotExecute";
}

interface ErrorInExecute {
    type: "ErrorInExecute";
    error: Error;
}

interface SuccessExecuteReturnValue {
    type: "SuccessExecuteReturnValue";
    value: any;
}

interface SuccessExecuteNoReturnValue {
    type: "SuccessExecuteNoReturnValue";
}

type EXECUTING_RESULT =
    | InvalidUsage
    | ShouldNotExecute
    | ErrorInExecute
    | SuccessExecuteReturnValue
    | SuccessExecuteNoReturnValue;

interface newProxifyUseCaseArgs {
    onWillNotExecute(args: Array<any>): void;

    onWillExecute(args: Array<any>): void;

    onDidExecute(result?: any): void;

    onError(error: Error): void;
}

/**
 * Create wrapper object of a UseCase.
 * This wrapper object only has `execute()` method.
 */
const proxifyUseCase = <T extends UseCaseLike>(useCase: T, handlers: newProxifyUseCaseArgs): T => {
    let isExecuted = false;
    const execute = (...args: Array<any>): EXECUTING_RESULT => {
        if (process.env.NODE_ENV !== "production") {
            if (isExecuted) {
                console.error(`Warning(UseCase): ${useCase.name}#execute was called more than once.`);
            }
        }
        isExecuted = true;
        // should the useCase execute?
        if (typeof useCase.shouldExecute === "function") {
            const shouldExecute = useCase.shouldExecute(args);
            if (typeof shouldExecute !== "boolean") {
                const error = new Error(
                    `<${useCase.name}>#shouldExecute should return boolean value. Actual return value: ${shouldExecute}`
                );
                return {
                    type: "InvalidUsage",
                    error
                };
            }
            if (!shouldExecute) {
                handlers.onWillNotExecute(args);
                return {
                    type: "ShouldNotExecute"
                };
            }
        }
        // will execute
        handlers.onWillExecute(args);

        try {
            // execute
            const result = useCase.execute(...args);
            handlers.onDidExecute(result);
            return {
                type: "SuccessExecuteReturnValue",
                value: result
            };
        } catch (error) {
            handlers.onError(error);
            handlers.onDidExecute();
            return {
                type: "ErrorInExecute",
                error
            };
        }
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
const warningUseCaseIsAlreadyReleased = (
    parentUseCase: UseCaseLike,
    useCase: UseCaseLike,
    payload: Payload,
    meta: DispatcherPayloadMeta
) => {
    console.error(
        `Warning(UseCase): ${useCase.name}'s parent UseCase(${parentUseCase.name}) is already released.
This UseCase(${useCase.name}) will not work correctly.
https://almin.js.org/docs/warnings/usecase-is-already-released.html
`,
        payload,
        meta
    );
};

export interface UseCaseExecutor<T extends UseCaseLike> extends Dispatcher {
    useCase: T;

    executor(executor: (useCase: Pick<T, "execute">) => any): Promise<void>;

    execute(): Promise<void>;

    execute<T>(args: T): Promise<void>;

    execute(...args: Array<any>): Promise<void>;

    release(): void;
}

/**
 * `UseCaseExecutor` is a helper class for executing UseCase.
 *
 * You can not create the instance of UseCaseExecutor directory.
 * You can get the instance by `Context#useCase(useCase)`,
 *
 */
export class UseCaseExecutorImpl<T extends UseCaseLike> extends Dispatcher implements UseCaseExecutor<T> {
    /**
     * A executable useCase
     */
    useCase: T;

    /**
     * A parent useCase
     */
    private _parentUseCase: UseCase | null;

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
    constructor({ useCase, parent }: { useCase: T; parent: UseCase | null }) {
        super();
        if (process.env.NODE_ENV !== "production") {
            // execute and finish =>
            const useCaseName = useCase.name;
            assert.ok(typeof useCaseName === "string", `UseCase instance should have constructor.name ${useCase}`);
            assert.ok(
                typeof useCase.execute === "function",
                `UseCase instance should have #execute function: ${useCaseName}`
            );
        }

        this.useCase = useCase;
        this._parentUseCase = parent;
        this._releaseHandlers = [];
        /**
         * ## Delegating Payload
         *
         * UseCase -> UseCaseExecutor -> UnitOfWork -> Dispatcher
         *
         */
        const unListenUseCaseToDispatcherHandler = this.useCase.pipe(this);
        this._releaseHandlers.push(unListenUseCaseToDispatcherHandler);
        // If this is parent UseCase, Parent UseCase -> UnitOfWork
        if (this._parentUseCase) {
            // Child -> Parent
            const unListenUseCaseExecutorToDispatcherHandler = this.pipe(this._parentUseCase);
            this._releaseHandlers.push(unListenUseCaseExecutorToDispatcherHandler);
        }
    }

    private willNotExecuteUseCase(args?: any[]): void {
        const payload = new WillNotExecutedPayload({
            args
        });
        const meta = new DispatcherPayloadMetaImpl({
            useCase: this.useCase,
            parentUseCase: this._parentUseCase,
            isTrusted: true,
            isUseCaseFinished: true
        });
        this.dispatch(payload, meta);
    }

    /**
     * @param   [args] arguments of the UseCase
     */
    private willExecuteUseCase(args?: any[]): void {
        // Add instance to manager
        // It should be removed when it will be completed.
        UseCaseInstanceMap.set(this.useCase, this);
        const payload = new WillExecutedPayload({
            args
        });
        const meta = new DispatcherPayloadMetaImpl({
            useCase: this.useCase,
            parentUseCase: this._parentUseCase,
            isTrusted: true,
            isUseCaseFinished: false
        });
        this.dispatch(payload, meta);
        // Warning: parentUseCase is already released
        if (process.env.NODE_ENV !== "production") {
            if (this._parentUseCase && !UseCaseInstanceMap.has(this._parentUseCase)) {
                warningUseCaseIsAlreadyReleased(this._parentUseCase, this.useCase, payload, meta);
            }
        }
    }

    /**
     * dispatch did execute each UseCase
     */
    private didExecuteUseCase(value?: any): void {
        // if the UseCase return a promise, almin recognize the UseCase as continuous.
        // In other word, If the UseCase want to continue, please return a promise object.
        const isResultPromise = typeof value === "object" && value !== null && typeof value.then == "function";
        const isUseCaseFinished = !isResultPromise;
        const payload = new DidExecutedPayload({
            value
        });
        const meta = new DispatcherPayloadMetaImpl({
            useCase: this.useCase,
            parentUseCase: this._parentUseCase,
            isTrusted: true,
            isUseCaseFinished
        });
        this.dispatch(payload, meta);
    }

    /**
     * dispatch complete each UseCase
     * @param   [value] unwrapped result value of the useCase executed
     */
    private completeUseCase(value?: any): void {
        const payload = new CompletedPayload({
            value
        });
        const meta = new DispatcherPayloadMetaImpl({
            useCase: this.useCase,
            parentUseCase: this._parentUseCase,
            isTrusted: true,
            isUseCaseFinished: true
        });
        this.dispatch(payload, meta);
        // Warning: parentUseCase is already released
        if (process.env.NODE_ENV !== "production") {
            if (this._parentUseCase && !UseCaseInstanceMap.has(this._parentUseCase)) {
                warningUseCaseIsAlreadyReleased(this._parentUseCase, this.useCase, payload, meta);
            }
        }
        // Delete the reference from instance manager
        // It prevent leaking of instance.
        UseCaseInstanceMap.delete(this.useCase);
    }

    /**
     * @private like
     */
    onRelease(handler: () => void): void {
        this.on("USECASE_EXECUTOR_RELEASE", handler);
    }

    /**
     * - **Stability**: Experimental
     * - This feature is subject to change. It may change or be removed in future versions.
     * - If you inserting in this, please see <https://github.com/almin/almin/issues/193>
     *
     * Similar to `execute(arguments)`, but it accept an executor function insteadof `arguments`
     * `executor(useCase => useCase.execute())` return a Promise object that resolved with undefined.
     *
     * This method is type-safe. It is useful for TypeScript.
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
     * ### I'm use TypeScript, Should I use `executor`?
     *
     * Yes. It is type-safe by default.
     * In other words, JavaScript User have not benefits.
     *
     * ### Why executor's result always to be undefined?
     *
     * UseCaseExecutor always resolve `undefined` data by design.
     * In CQRS, the command always have returned void type.
     *
     * - http://cqrs.nu/Faq
     *
     * So, Almin return only command result that is success or failure.
     * You should not relay on the data of the command result.
     */
    executor(executor: (useCase: Pick<T, "execute">) => any): Promise<void> {
        if (typeof executor !== "function") {
            console.error(
                "Warning(UseCase): executor argument should be function. But this argument is not function: ",
                executor
            );
            return Promise.reject(new Error("executor(fn) arguments should be function"));
        }
        // Notes: proxyfiedUseCase has not timeout
        // proxiedUseCase will resolve by UseCaseWrapper#execute
        // For more details, see <UseCaseLifeCycle-test.ts>
        const proxyfiedUseCase = proxifyUseCase<T>(this.useCase, {
            onWillNotExecute: args => {
                this.willNotExecuteUseCase(args);
            },
            onWillExecute: args => {
                this.willExecuteUseCase(args);
            },
            onDidExecute: (result?: any) => {
                this.didExecuteUseCase(result);
            },
            onError: (error: Error) => {
                this.useCase.throwError(error);
            }
        });
        // Note: almin disallow to call `executor(useCase => { setTimeout(() => useCase.execute(), 0}})` asynchronously
        // You should call UseCase#execute synchronously.
        const executorResult: EXECUTING_RESULT | undefined = executor(proxyfiedUseCase);
        // `executorResult` is undefined means that the UseCase#execute never return any value
        // In JavaScript, no return as undefined value
        const executedResult: EXECUTING_RESULT =
            executorResult !== undefined
                ? executorResult
                : {
                      type: "SuccessExecuteNoReturnValue"
                  };
        // if does not execute, release and resolve as soon as possible
        if (executedResult.type === "ShouldNotExecute") {
            this.release();
            return Promise.resolve();
        }
        const startingExecutor = new Promise((resolve, reject) => {
            switch (executedResult.type) {
                case "InvalidUsage":
                    return reject(executedResult.error);
                case "ErrorInExecute":
                    return reject(executedResult.error);
                case "SuccessExecuteReturnValue": {
                    // try to resolve return value
                    // if the return promise is reject, report error from UseCase
                    return Promise.resolve(executedResult.value).then(resolve, error => {
                        this.useCase.throwError(error);
                        return reject(error);
                    });
                }
                case "SuccessExecuteNoReturnValue":
                    // The UseCase#execute just success without return value
                    return resolve();
            }
        });
        return startingExecutor
            .then(result => {
                this.completeUseCase(result);
                this.release();
            })
            .catch(error => {
                this.completeUseCase();
                this.release();
                return Promise.reject(error);
            });
    }

    /**
     * execute UseCase instance.
     * UseCase is a executable object that has `execute` method.
     *
     * This method invoke UseCase's `execute` method and return a promise<void>.
     * The promise will be resolved when the UseCase is completed finished.
     *
     * ## Notes
     *
     * The `execute(arguments)` is shortcut of `executor(useCase => useCase.execute(arguments)`
     *
     */
    execute(): Promise<void>;
    execute<T>(args: T): Promise<void>;
    execute(...args: Array<any>): Promise<void> {
        return this.executor(useCase => useCase.execute(...args));
    }

    /**
     * release all events handler.
     * You can call this when no more call event handler
     */
    release(): void {
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
        this.emit("USECASE_EXECUTOR_RELEASE");
        this.removeAllListeners();
    }
}
