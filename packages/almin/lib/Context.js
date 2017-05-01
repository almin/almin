// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Context = undefined;

var _assert = require("assert");

var assert = _interopRequireWildcard(_assert);

var _UseCase = require("./UseCase");

var _UseCaseExecutor = require("./UseCaseExecutor");

var _StoreGroupValidator = require("./UILayer/StoreGroupValidator");

var _CompletedPayload = require("./payload/CompletedPayload");

var _DidExecutedPayload = require("./payload/DidExecutedPayload");

var _ErrorPayload = require("./payload/ErrorPayload");

var _WillExecutedPayload = require("./payload/WillExecutedPayload");

var _FunctionalUseCase = require("./FunctionalUseCase");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
// payloads


/**
 * Context class provide observing and communicating with **Store** and **UseCase**.
 */
var Context = function () {
    /**
     * `dispatcher` is an instance of `Dispatcher`.
     * `store` is an instance of StoreLike implementation
     *
     * ### Example
     *
     * It is minimal initialization.
     *
     * ```js
     * const context = new Context({
     *   dispatcher: new Dispatcher(),
     *   store: new Store()
     * });
     * ```
     *
     * In real case, you can pass `StoreGroup` instead of `Store`.
     *
     * ```js
     * const storeGroup = new StoreGroup([
     *   new AStore(), new BStore(), new CStore()
     * ]);
     * const context = new Context({
     *   dispatcher: new Dispatcher(),
     *   store: new Store()
     * });
     * ```
     */
    function Context(_ref) {
        var dispatcher = _ref.dispatcher,
            store = _ref.store;

        _classCallCheck(this, Context);

        _StoreGroupValidator.StoreGroupValidator.validateInstance(store);
        // central dispatcher
        this._dispatcher = dispatcher;
        this._storeGroup = store;
        /**
         * callable release handlers
         * @type {Function[]}
         * @private
         */
        this._releaseHandlers = [];
        // Implementation Note:
        // Delegate dispatch event to Store|StoreGroup from Dispatcher
        // Dispatch Flow: Dispatcher -> StoreGroup -> Store
        var releaseHandler = this._dispatcher.pipe(this._storeGroup);
        this._releaseHandlers.push(releaseHandler);
    }
    /**
     * Return state value of StoreGroup or Store.
     *
     * ### Example
     *
     * If you pass `StoreGroup` to `store` of Constructor,
     * `Context#getState()` return the state object that merge each stores's state.
     *
     * ```js
     * const state = context.getState();
     * console.log(state);
     * // { aState, bState }
     * ```
     */


    Context.prototype.getState = function getState() {
        return this._storeGroup.getState();
    };
    /**
     * If anyone store that is passed to constructor is changed, then call `onChange`.
     * `onChange` arguments is an array of `Store` instances.
     *
     * It returns unSubscribe function.
     * If you want to release handler, the returned function.
     *
     * ### Example
     *
     * ```js
     * const unSubscribe = context.onChange(changingStores => {
     *   console.log(changingStores); // Array<Store>
     * });
     * ```
     */


    Context.prototype.onChange = function onChange(handler) {
        return this._storeGroup.onChange(handler);
    };

    Context.prototype.useCase = function useCase(_useCase) {
        // instance of UseCase
        if (_UseCase.UseCase.isUseCase(_useCase)) {
            return new _UseCaseExecutor.UseCaseExecutor({
                useCase: _useCase,
                parent: null,
                dispatcher: this._dispatcher
            });
        } else if (typeof _useCase === "function") {
            // When pass UseCase constructor itself, throw assertion error
            assert.ok(Object.getPrototypeOf && Object.getPrototypeOf(_useCase) !== _UseCase.UseCase, "Context#useCase argument should be instance of UseCase.\nThe argument is UseCase constructor itself: " + _useCase);
            // function to be FunctionalUseCase
            var functionalUseCase = new _FunctionalUseCase.FunctionalUseCase(_useCase, this._dispatcher);
            return new _UseCaseExecutor.UseCaseExecutor({
                useCase: functionalUseCase,
                parent: null,
                dispatcher: this._dispatcher
            });
        }
        throw new Error("Context#useCase argument should be UseCase: " + _useCase);
    };
    /**
     * Register `handler` function to Context.
     * `handler` is called when each useCases will execute.
     */


    Context.prototype.onWillExecuteEachUseCase = function onWillExecuteEachUseCase(handler) {
        var releaseHandler = this._dispatcher.onDispatch(function (payload, meta) {
            if ((0, _WillExecutedPayload.isWillExecutedPayload)(payload)) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    };
    /**
     * Register `handler` function to Context.
     * `handler` is called the `handler` with user-defined payload object when the UseCase dispatch with payload.
     * This `onDispatch` is not called at built-in event. It is filtered by Context.
     * If you want to *All* dispatched event and use listen directly your `dispatcher` object.
     * In other word, listen the dispatcher of `new Context({dispatcher})`.
     *
     * ### Example
     *
     * ```js
     * const dispatchUseCase = ({dispatcher}) => {
     *   return () => dispatcher.dispatch({ type: "fired-payload" });
     * };
     * context.onDispatch((payload, meta) => {
     *   console.log(payload); // { type: "fired-payload" }
     * });
     *
     * context.useCase(dispatchUseCase).execute();
     * ```
     */


    Context.prototype.onDispatch = function onDispatch(handler) {
        var releaseHandler = this._dispatcher.onDispatch(function (payload, meta) {
            // call handler, if payload's type is not built-in event.
            // It means that `onDispatch` is called when dispatching user event.
            if (!meta.isTrusted) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    };
    /**
     * `handler` is called when each useCases are executed.
     */


    Context.prototype.onDidExecuteEachUseCase = function onDidExecuteEachUseCase(handler) {
        var releaseHandler = this._dispatcher.onDispatch(function (payload, meta) {
            if ((0, _DidExecutedPayload.isDidExecutedPayload)(payload)) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    };
    /**
     * `handler` is called when each useCases are completed.
     * This `handler` is always called asynchronously.
     */


    Context.prototype.onCompleteEachUseCase = function onCompleteEachUseCase(handler) {
        var releaseHandler = this._dispatcher.onDispatch(function (payload, meta) {
            if ((0, _CompletedPayload.isCompletedPayload)(payload)) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    };
    /**
     * `handler` is called when some UseCase throw Error.
     *
     * Throwing Error is following case:
     *
     * - Throw exception in a UseCase
     * - Return rejected promise in a UseCase
     * - Call `UseCase#throwError(error)`
     */


    Context.prototype.onErrorDispatch = function onErrorDispatch(handler) {
        var releaseHandler = this._dispatcher.onDispatch(function (payload, meta) {
            if ((0, _ErrorPayload.isErrorPayload)(payload)) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    };
    /**
     * Release all events handler in Context.
     * You can call this when no more call event handler
     */


    Context.prototype.release = function release() {
        var storeGroup = this._storeGroup;
        if (storeGroup) {
            storeGroup.release();
        }
        this._releaseHandlers.forEach(function (releaseHandler) {
            return releaseHandler();
        });
        this._releaseHandlers.length = 0;
    };

    return Context;
}();

exports.Context = Context;
//# sourceMappingURL=Context.js.map