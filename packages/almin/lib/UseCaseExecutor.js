// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UseCaseExecutor = undefined;

var _assert = require("assert");

var assert = _interopRequireWildcard(_assert);

var _DispatcherPayloadMeta = require("./DispatcherPayloadMeta");

var _UseCaseInstanceMap = require("./UseCaseInstanceMap");

var _CompletedPayload = require("./payload/CompletedPayload");

var _DidExecutedPayload = require("./payload/DidExecutedPayload");

var _WillExecutedPayload = require("./payload/WillExecutedPayload");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
// payloads


/**
 * When child is completed after parent did completed, display warning warning message
 * @private
 */
var warningUseCaseIsAlreadyReleased = function warningUseCaseIsAlreadyReleased(parentUseCase, useCase, payload, meta) {
    console.warn(useCase.name + "'s parent UseCase(" + parentUseCase.name + ") is already released.\nThis UseCase(" + useCase.name + ") will not work correctly.\nhttps://almin.js.org/docs/warnings/usecase-is-already-released.html\n", payload, meta);
};
/**
 * `UseCaseExecutor` is a helper class for executing UseCase.
 *
 * You can not create the instance of UseCaseExecutor directory.
 * You can get the instance by `Context#useCase(useCase)`,
 *
 * @private
 */

var UseCaseExecutor = exports.UseCaseExecutor = function () {
    /**
     * @param   useCase
     * @param   parent
     *      parent is parent of `useCase`
     * @param   dispatcher
     * @public
     *
     * **internal** documentation
     */
    function UseCaseExecutor(_ref) {
        var useCase = _ref.useCase,
            parent = _ref.parent,
            dispatcher = _ref.dispatcher;

        _classCallCheck(this, UseCaseExecutor);

        if (process.env.NODE_ENV !== "production") {
            // execute and finish =>
            var useCaseName = useCase.name;
            assert.ok(typeof useCaseName === "string", "UseCase instance should have constructor.name " + useCase);
            assert.ok(typeof useCase.execute === "function", "UseCase instance should have #execute function: " + useCaseName);
        }
        this._useCase = useCase;
        this._parentUseCase = parent;
        this._dispatcher = dispatcher;
        this._releaseHandlers = [];
        // delegate userCase#onDispatch to central dispatcher
        var unListenHandler = this._useCase.pipe(this._dispatcher);
        this._releaseHandlers.push(unListenHandler);
    }
    /**
     * @param   [args] arguments of the UseCase
     */


    UseCaseExecutor.prototype._willExecute = function _willExecute(args) {
        // Add instance to manager
        // It should be removed when it will be completed.
        _UseCaseInstanceMap.UseCaseInstanceMap.set(this._useCase, this);
        var payload = new _WillExecutedPayload.WillExecutedPayload({
            args: args
        });
        var meta = new _DispatcherPayloadMeta.DispatcherPayloadMetaImpl({
            useCase: this._useCase,
            dispatcher: this._dispatcher,
            parentUseCase: this._parentUseCase,
            isTrusted: true,
            isUseCaseFinished: false
        });
        this._dispatcher.dispatch(payload, meta);
        // Warning: parentUseCase is already released
        if (process.env.NODE_ENV !== "production") {
            if (this._parentUseCase && !_UseCaseInstanceMap.UseCaseInstanceMap.has(this._parentUseCase)) {
                warningUseCaseIsAlreadyReleased(this._parentUseCase, this._useCase, payload, meta);
            }
        }
    };
    /**
     * dispatch did execute each UseCase
     */


    UseCaseExecutor.prototype._didExecute = function _didExecute(isFinished, value) {
        var payload = new _DidExecutedPayload.DidExecutedPayload({
            value: value
        });
        var meta = new _DispatcherPayloadMeta.DispatcherPayloadMetaImpl({
            useCase: this._useCase,
            dispatcher: this._dispatcher,
            parentUseCase: this._parentUseCase,
            isTrusted: true,
            isUseCaseFinished: isFinished
        });
        this._dispatcher.dispatch(payload, meta);
    };
    /**
     * dispatch complete each UseCase
     * @param   [value] unwrapped result value of the useCase executed
     */


    UseCaseExecutor.prototype._complete = function _complete(value) {
        var payload = new _CompletedPayload.CompletedPayload({
            value: value
        });
        var meta = new _DispatcherPayloadMeta.DispatcherPayloadMetaImpl({
            useCase: this._useCase,
            dispatcher: this._dispatcher,
            parentUseCase: this._parentUseCase,
            isTrusted: true,
            isUseCaseFinished: true
        });
        this._dispatcher.dispatch(payload, meta);
        // Warning: parentUseCase is already released
        if (process.env.NODE_ENV !== "production") {
            if (this._parentUseCase && !_UseCaseInstanceMap.UseCaseInstanceMap.has(this._parentUseCase)) {
                warningUseCaseIsAlreadyReleased(this._parentUseCase, this._useCase, payload, meta);
            }
        }
        // Delete the reference from instance manager
        // It prevent leaking of instance.
        _UseCaseInstanceMap.UseCaseInstanceMap.delete(this._useCase);
    };
    /**
     * called the {@link handler} with useCase when the useCase will do.
     * @param   handler
     */


    UseCaseExecutor.prototype.onWillExecuteEachUseCase = function onWillExecuteEachUseCase(handler) {
        var releaseHandler = this._dispatcher.onDispatch(function onWillExecute(payload, meta) {
            if ((0, _WillExecutedPayload.isWillExecutedPayload)(payload)) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    };
    /**
     * called the `handler` with useCase when the useCase is executed.
     * @param   handler
     */


    UseCaseExecutor.prototype.onDidExecuteEachUseCase = function onDidExecuteEachUseCase(handler) {
        var releaseHandler = this._dispatcher.onDispatch(function onDidExecuted(payload, meta) {
            if ((0, _DidExecutedPayload.isDidExecutedPayload)(payload)) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    };
    /**
     * called the `handler` with useCase when the useCase is completed.
     * @param   handler
     * @returns
     */


    UseCaseExecutor.prototype.onCompleteExecuteEachUseCase = function onCompleteExecuteEachUseCase(handler) {
        var releaseHandler = this._dispatcher.onDispatch(function onCompleted(payload, meta) {
            if ((0, _CompletedPayload.isCompletedPayload)(payload)) {
                handler(payload, meta);
            }
        });
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    };

    UseCaseExecutor.prototype.execute = function execute() {
        var _useCase,
            _this = this;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        this._willExecute(args);
        var result = (_useCase = this._useCase).execute.apply(_useCase, args);
        var isResultPromise = result && typeof result.then == "function";
        // if the UseCase return a promise, almin recognize the UseCase as continuous.
        // In other word, If the UseCase want to continue, please return a promise object.
        var isUseCaseFinished = !isResultPromise;
        // Sync call didExecute
        this._didExecute(isUseCaseFinished, result);
        // Async call complete
        return Promise.resolve(result).then(function (result) {
            _this._complete(result);
            _this.release();
        }).catch(function (error) {
            _this._useCase.throwError(error);
            _this._complete();
            _this.release();
            return Promise.reject(error);
        });
    };
    /**
     * release all events handler.
     * You can call this when no more call event handler
     */


    UseCaseExecutor.prototype.release = function release() {
        this._releaseHandlers.forEach(function (releaseHandler) {
            return releaseHandler();
        });
        this._releaseHandlers.length = 0;
    };

    return UseCaseExecutor;
}();
//# sourceMappingURL=UseCaseExecutor.js.map