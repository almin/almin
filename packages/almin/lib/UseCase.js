// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UseCase = exports.defaultUseCaseName = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Dispatcher2 = require("./Dispatcher");

var _UseCaseContext = require("./UseCaseContext");

var _DispatcherPayloadMeta = require("./DispatcherPayloadMeta");

var _ErrorPayload = require("./payload/ErrorPayload");

var _UseCaseIdGenerator = require("./UseCaseIdGenerator");

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var defaultUseCaseName = exports.defaultUseCaseName = "<Anonymous-UseCase>";
/**
 * A `UseCase` class is inherited Dispatcher.
 * The user implement own user-case that is inherited UseCase class
 *
 * It similar to ActionCreator on Flux.
 *
 * ### Example
 *
 * ```js
 * import {UseCase} from "almin";
 * class AwesomeUseCase extends UseCase {
 *    execute(){
 *       // implementation own use-case
 *   }
 * }
 * ```
 */

var UseCase = exports.UseCase = function (_Dispatcher) {
    _inherits(UseCase, _Dispatcher);

    /**
     * Return true if the `v` is a UseCase-like.
     */
    UseCase.isUseCase = function isUseCase(v) {
        if (v instanceof UseCase) {
            return true;
        } else if ((typeof v === "undefined" ? "undefined" : _typeof(v)) === "object" && typeof v.execute === "function") {
            return true;
        }
        return false;
    };
    /**
     * Constructor not have arguments.
     */


    function UseCase() {
        _classCallCheck(this, UseCase);

        var _this = _possibleConstructorReturn(this, _Dispatcher.call(this));

        _this.id = (0, _UseCaseIdGenerator.generateNewId)();
        var own = _this.constructor;
        _this.name = own.displayName || own.name || defaultUseCaseName;
        return _this;
    }
    /**
     * Get `context` of UseCase.
     * You can execute sub UseCase using UseCaseContext object.
     *
     * See following for more details.
     *
     * - [UseCaseContext](https://almin.js.org/docs/api/UseCaseContext.html)
     * - [Nesting UseCase](https://almin.js.org/docs/tips/nesting-usecase.html)
     *
     * ### Example
     *
     * ```js
     * // Parent -> ChildUseCase
     * export class ParentUseCase extends UseCase {
     *     execute() {
     *         // execute child use-case using UseCaseContext object.
     *         return this.context.useCase(new ChildUseCase()).execute();
     *     }
     * }
     * export class ChildUseCase extends UseCase {
     *     execute() {
     *         this.dispatch({
     *             type: "ChildUseCase"
     *         });
     *     }
     * }
     * ```
     */


    /**
     * `UseCase#execute()` method should be overwrite by subclass.
     *
     * ### Example
     *
     * ```js
     * class AwesomeUseCase extends UseCase {
     *    execute(){
     *       // implementation own use-case
     *   }
     * }
     * ```
     *
     *  FIXME: mark this as `abstract` property.
     */
    UseCase.prototype.execute = function execute() {
        throw new TypeError("should be overwrite " + this.constructor.name + "#execute()");
    };
    /**
     * Dispatch `payload` object.
     *
     * `Store` or `Context` can receive the `payload` object.n
     */


    UseCase.prototype.dispatch = function dispatch(payload, meta) {
        // system dispatch has meta
        // But, when meta is empty, the `payload` object generated by user
        var useCaseMeta = meta ? meta : new _DispatcherPayloadMeta.DispatcherPayloadMetaImpl({
            // this dispatch payload generated by this UseCase
            useCase: this,
            // dispatcher is the UseCase
            dispatcher: this,
            // parent is the same with UseCase. because this useCase dispatch the payload
            parentUseCase: null,
            // the user create this payload
            isTrusted: false,
            // Always false because the payload is dispatched from this working useCase.
            isUseCaseFinished: false
        });
        _Dispatcher.prototype.dispatch.call(this, payload, useCaseMeta);
    };
    /**
     * `errorHandler` is called with error when error is thrown.
     */


    UseCase.prototype.onError = function onError(errorHandler) {
        return this.onDispatch(function (payload) {
            if ((0, _ErrorPayload.isErrorPayload)(payload)) {
                errorHandler(payload.error);
            }
        });
    };
    /**
     * Throw error payload.
     *
     * You can use it instead of `throw new Error()`
     * This error event is caught by dispatcher.
     */


    UseCase.prototype.throwError = function throwError(error) {
        var meta = new _DispatcherPayloadMeta.DispatcherPayloadMetaImpl({
            useCase: this,
            dispatcher: this,
            isTrusted: true,
            isUseCaseFinished: false
        });
        var payload = new _ErrorPayload.ErrorPayload({
            error: error
        });
        this.dispatch(payload, meta);
    };

    _createClass(UseCase, [{
        key: "context",
        get: function get() {
            return new _UseCaseContext.UseCaseContext(this);
        }
    }]);

    return UseCase;
}(_Dispatcher2.Dispatcher);
//# sourceMappingURL=UseCase.js.map