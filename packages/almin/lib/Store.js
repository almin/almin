// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Store = exports.defaultStoreName = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Dispatcher2 = require("./Dispatcher");

var _shallowEqualObject = require("shallow-equal-object");

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var STATE_CHANGE_EVENT = "STATE_CHANGE_EVENT";
/**
 * @type {string}
 * @private
 */
var defaultStoreName = exports.defaultStoreName = "<Anonymous-Store>";
/**
 * Store hold the state of your application.
 *
 * Typically, `Store` has a parts of the whole state tree of your application.
 * `StoreGroup` is the the whole state tree.
 *
 * It means that `StoreGroup` is a collection of `Store` instances.
 *
 * A UseCase `dispatch(payload)` and `Store` can receive it.
 *
 * ### Abstraction Code
 *
 * This is imagination code. (It will not work.)
 *
 * ```js
 * abcUseCase
 *  .dispatch({
 *      type: "ABC",
 *      value: "value"
 *  });
 *
 * abcStore
 *  .onDispatch(({ type, value }) => {
 *      console.log(type);  // "ABC"
 *      console.log(value); // 42
 *  });
 * ```
 *
 * ### Example
 *
 * To implement store, you have to inherit `Store` class.
 *
 * ```js
 * class YourStore extends Store {
 *    constructor(){
 *       super();
 *       this.state = {
 *          foo : "bar"
 *       };
 *    }
 *    getState(){
 *      return {
 *          yourStore: this.state
 *      };
 *    }
 * }
 * ```
 */

var Store = exports.Store = function (_Dispatcher) {
    _inherits(Store, _Dispatcher);

    /**
     * Constructor not have arguments.
     */
    function Store() {
        _classCallCheck(this, Store);

        var _this = _possibleConstructorReturn(this, _Dispatcher.call(this));

        var own = _this.constructor;
        /**
         * @type {string} Store name
         */
        _this.name = own.displayName || own.name || defaultStoreName;
        return _this;
    }
    /**
     * Return true if the `v` is store like.
     */


    Store.isStore = function isStore(v) {
        if (v instanceof Store) {
            return true;
        } else if ((typeof v === "undefined" ? "undefined" : _typeof(v)) === "object" && typeof v.getState === "function" && typeof v.onChange === "function") {
            return true;
        }
        return false;
    };
    /**
     * Update own state property if needed.
     * If `this.shouldStateUpdate(currentState, newState)` return true, update `this.state` property with `newState`.
     */


    Store.prototype.setState = function setState(newState) {
        if (this.shouldStateUpdate(this.state, newState)) {
            this.state = newState;
        }
    };
    /**
     * If the prev/next state is difference, should return true.
     *
     * Use Shallow Object Equality Test by default.
     * <https://github.com/sebmarkbage/ecmascript-shallow-equal>
     */


    Store.prototype.shouldStateUpdate = function shouldStateUpdate(prevState, nextState) {
        return !(0, _shallowEqualObject.shallowEqual)(prevState, nextState);
    };
    /**
     * Subscribe change event of the store.
     * When `Store#emitChange()` is called, then call subscribers.
     *
     * ### Example
     *
     * ```js
     * store.onChange((changingStores) => {
     *    console.log(changingStores); // [store]
     * });
     *
     * store.emitChange();
     * ```
     */


    Store.prototype.onChange = function onChange(cb) {
        this.on(STATE_CHANGE_EVENT, cb);
        return this.removeListener.bind(this, STATE_CHANGE_EVENT, cb);
    };
    /**
     * Emit "change" event to subscribers.
     * If you want to notify changing ot tha store, call `Store#emitChange()`.
     */


    Store.prototype.emitChange = function emitChange() {
        this.emit(STATE_CHANGE_EVENT, [this]);
    };
    /**
     * Release all event handlers
     */


    Store.prototype.release = function release() {
        this.removeAllListeners(STATE_CHANGE_EVENT);
    };

    return Store;
}(_Dispatcher2.Dispatcher);
// Implement assertion


Store.prototype.getState = function () {
    throw new Error(this.name + " should be implemented Store#getState(): Object");
};
//# sourceMappingURL=Store.js.map