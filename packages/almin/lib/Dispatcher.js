// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Dispatcher = exports.ON_DISPATCH = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _assert = require("assert");

var assert = _interopRequireWildcard(_assert);

var _events = require("events");

var _DispatcherPayloadMeta = require("./DispatcherPayloadMeta");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

/**
 * @private
 */
var ON_DISPATCH = exports.ON_DISPATCH = "__ON_DISPATCH__";
/**
 * Dispatcher is the **central** event bus system.
 *
 * `Dispatcher` class  have these method.
 *
 * - `onDispatch(function(payload){ });`
 * - `dispatch(payload);`
 *
 * It is similar with EventEmitter of Node.js
 * But, Dispatcher use `payload` object as arguments.
 *
 * ## Payload
 *
 * `payload` object must have `type` property.
 * Following object is a minimal `payload` object.
 *
 * ```json
 * {
 *     "type": "type"
 * }
 * ```
 *
 * Also, You can put any property to payload object.
 *
 * ```json
 * {
 *     "type": "show",
 *     "value": "value"
 * }
 * ```
 *
 * ### FAQ
 *
 * Q. Why Almin use `payload` object instead `emit(key, ...args)`?
 *
 * A. It is for optimization and limitation.
 * If apply emit style, we should cast `...args` for passing other dispatcher at every time.
 * So, Almin use `payload` object instead of it without casting.
 */

var Dispatcher = exports.Dispatcher = function (_EventEmitter) {
    _inherits(Dispatcher, _EventEmitter);

    /**
     * if `v` is instance of Dispatcher, return true
     */
    Dispatcher.isDispatcher = function isDispatcher(v) {
        if (v instanceof Dispatcher) {
            return true;
        } else if ((typeof v === "undefined" ? "undefined" : _typeof(v)) === "object" && typeof v.onDispatch === "function" && typeof v.dispatch === "function") {
            return true;
        }
        return false;
    };
    /**
     * constructor not have arguments.
     **/


    function Dispatcher() {
        _classCallCheck(this, Dispatcher);

        // suppress: memory leak warning of EventEmitter
        // Dispatcher can listen more than 10 events
        var _this = _possibleConstructorReturn(this, _EventEmitter.call(this));

        _this.setMaxListeners(0);
        return _this;
    }
    /**
     * Add `handler`(subscriber) to Dispatcher and return unsubscribe function
     *
     * ### Example
     *
     * ```js
     * const dispatcher = new Dispatcher();
     * const unsubscribe = dispatcher.onDispatch((payload, meta) => {});
     * unsubscribe(); // release handler
     * ```
     */


    Dispatcher.prototype.onDispatch = function onDispatch(handler) {
        this.on(ON_DISPATCH, handler);
        return this.removeListener.bind(this, ON_DISPATCH, handler);
    };
    /**
     * Dispatch `payload` to subscribers.
     */


    Dispatcher.prototype.dispatch = function dispatch(payload, meta) {
        if (process.env.NODE_ENV !== "production") {
            assert.ok(payload !== undefined && payload !== null, "payload should not null or undefined");
            assert.ok(typeof payload.type !== "undefined", "payload's `type` should be required");
            if (meta !== undefined) {
                assert.ok(meta instanceof _DispatcherPayloadMeta.DispatcherPayloadMetaImpl, "`meta` object is internal arguments.");
            }
        }
        // `meta` must be generated by system
        if (meta instanceof _DispatcherPayloadMeta.DispatcherPayloadMetaImpl) {
            this.emit(ON_DISPATCH, payload, meta);
        } else {
            // the `payload` object generated by user
            var dispatchOnlyMeta = new _DispatcherPayloadMeta.DispatcherPayloadMetaImpl({
                dispatcher: this,
                isTrusted: false
            });
            this.emit(ON_DISPATCH, payload, dispatchOnlyMeta);
        }
    };
    /**
     * Delegate payload object to other dispatcher.
     *
     * ### Example
     *
     * ```js
     * const a = new Dispatcher();
     * const b = new Dispatcher();
     * // Delegate `a` to `b`
     * a.pipe(b);
     * // dispatch and `b` can receive it.
     * a.dispatch({ type : "a" });
     * ```
     */


    Dispatcher.prototype.pipe = function pipe(toDispatcher) {
        var fromName = this.constructor.name;
        var toName = toDispatcher.constructor.name;
        var displayName = "delegate-payload:" + fromName + "-to-" + toName;
        var delegatePayload = function delegatePayload(payload, meta) {
            delegatePayload.displayName = displayName;
            toDispatcher.dispatch(payload, meta);
        };
        return this.onDispatch(delegatePayload);
    };

    return Dispatcher;
}(_events.EventEmitter);
//# sourceMappingURL=Dispatcher.js.map