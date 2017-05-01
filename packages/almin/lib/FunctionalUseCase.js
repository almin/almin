// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FunctionalUseCase = exports.defaultUseCaseName = undefined;

var _Dispatcher2 = require("./Dispatcher");

var _UseCaseIdGenerator = require("./UseCaseIdGenerator");

var _DispatcherPayloadMeta = require("./DispatcherPayloadMeta");

var _ErrorPayload = require("./payload/ErrorPayload");

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var defaultUseCaseName = exports.defaultUseCaseName = "<Functiona-UseCase>";
/**
 * Functional version of UseCase class.
 * The user pass a function as UseCase
 * @example
 *
 * const functionalUseCase = ({ dispatcher }) => {
 *   return (...args) => {
 *      dispatcher.dispatch({ type: "fire" });
 *   }
 * }
 *
 */

var FunctionalUseCase = exports.FunctionalUseCase = function (_Dispatcher) {
    _inherits(FunctionalUseCase, _Dispatcher);

    function FunctionalUseCase(functionUseCase, dispatcher) {
        _classCallCheck(this, FunctionalUseCase);

        var _this = _possibleConstructorReturn(this, _Dispatcher.call(this));

        var context = {
            dispatcher: dispatcher
        };
        _this.dispatcher = dispatcher;
        /*
            const functionalUseCase = ({ dispatcher }) => {
                return (...args) => { } // <= executor
            }
         */
        _this.executor = functionUseCase(context);
        _this.id = (0, _UseCaseIdGenerator.generateNewId)();
        _this.name = functionUseCase.displayName || functionUseCase.name || defaultUseCaseName;
        return _this;
    }
    /**
     * execute functional UseCase
     */


    FunctionalUseCase.prototype.execute = function execute() {
        return this.executor.apply(this, arguments);
    };
    /**
     * implementation throwError
     * @param error
     */


    FunctionalUseCase.prototype.throwError = function throwError(error) {
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

    return FunctionalUseCase;
}(_Dispatcher2.Dispatcher);
//# sourceMappingURL=FunctionalUseCase.js.map