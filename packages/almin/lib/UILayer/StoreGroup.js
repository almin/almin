// MIT © 2017 azu
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StoreGroup = exports.InitializedPayload = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _assert = require("assert");

var assert = _interopRequireWildcard(_assert);

var _mapLike = require("map-like");

var _mapLike2 = _interopRequireDefault(_mapLike);

var _Payload2 = require("../payload/Payload");

var _ErrorPayload = require("../payload/ErrorPayload");

var _WillExecutedPayload = require("../payload/WillExecutedPayload");

var _DidExecutedPayload = require("../payload/DidExecutedPayload");

var _CompletedPayload = require("../payload/CompletedPayload");

var _shallowEqualObject = require("shallow-equal-object");

var _Dispatcher2 = require("../Dispatcher");

var _StoreStateMap = require("./StoreStateMap");

var _Store = require("../Store");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var CHANGE_STORE_GROUP = "CHANGE_STORE_GROUP";
/**
 * Initialized Payload
 * This is exported for an unit testing.
 * DO NOT USE THIS in your application.
 */

var InitializedPayload = exports.InitializedPayload = function (_Payload) {
    _inherits(InitializedPayload, _Payload);

    function InitializedPayload() {
        _classCallCheck(this, InitializedPayload);

        return _possibleConstructorReturn(this, _Payload.call(this, { type: "Almin__InitializedPayload__" }));
    }

    return InitializedPayload;
}(_Payload2.Payload);
// InitializedPayload for passing to Store if the state change is not related payload.


var initializedPayload = new InitializedPayload();
/**
 * assert: check arguments of constructor.
 */
var assertConstructorArguments = function assertConstructorArguments(arg) {
    var message = "Should initialize this StoreGroup with a stateName-store mapping object.\nconst aStore = new AStore();\nconst bStore = new BStore();\n// A arguments is stateName-store mapping object like { stateName: store }\nconst storeGroup = new CQRSStoreGroup({\n    a: aStore,\n    b: bStore\n});\nconsole.log(storeGroup.getState());\n// { a: \"a value\", b: \"b value\" }\n";
    assert.ok((typeof arg === "undefined" ? "undefined" : _typeof(arg)) === "object" && arg !== null && !Array.isArray(arg), message);
    var keys = Object.keys(arg);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = arg[key];
        // Don't checking for accepting string or symbol.
        // assert.ok(typeof key === "string", `key should be string type: ${key}: ${value}` + "\n" + message);
        assert.ok(_Store.Store.isStore(value), "value should be instance of Store: " + key + ": " + value + "\n" + message);
    }
};
/**
 * warning: check immutability of the `store`'s state
 * If the store call `Store#emitChange()` and the state of store is not changed, throw error.
 * https://github.com/almin/almin/issues/151
 */
var warningStateIsImmutable = function warningStateIsImmutable(prevState, nextState, store, changingStores) {
    var shouldStateUpdate = function shouldStateUpdate(prevState, nextState) {
        if (typeof store.shouldStateUpdate === "function") {
            return store.shouldStateUpdate(prevState, nextState);
        }
        return prevState !== nextState;
    };
    // If the store emitChange, check immutability
    var isChangingStore = changingStores.indexOf(store) !== -1;
    if (isChangingStore) {
        var isStateChanged = shouldStateUpdate(prevState, nextState);
        if (!isStateChanged) {
            console.warn("Store(" + store.name + ") does call emitChange(). \nBut, this store's state is not changed.\nStore's state should be immutable value.\nPrev State:", prevState, "Next State:", nextState);
        }
    }
    // If the store return **changed** state, but shouldStateUpdate return false.
    // This checker aim to find updating that is not reflected to UI.
    if (!store.hasOwnProperty("state")) {
        return;
    }
    // store.state is not same with getState value
    // It means `store.state` is not related with getState
    if (store.state !== nextState) {
        return;
    }
    var isStatePropertyChanged = prevState !== nextState;
    var isStateChangedButShouldNotUpdate = isStatePropertyChanged && !shouldStateUpdate(prevState, nextState);
    if (isStateChangedButShouldNotUpdate) {
        console.warn(store.name + "#state property is changed, but this change does not reflect to view.\nBecause, " + store.name + "#shouldStateUpdate(prevState, store.state) has returned **false**.\nIt means that the variance is present between store's state and shouldStateUpdate.\nYou should update the state vis `Store#setState` method.\n\nFor example, you should update the state by following:\n\n    this.setState(newState);\n    \n    // OR\n\n    if(this.shouldStateUpdate(this.state, newState)){\n        this.state = newState;\n    }\n", "prevState", prevState, "nextState", nextState);
    }
};
/**
 * StoreGroup is a parts of read-model.
 *
 * StoreGroup has separated two phase in a life-cycle.
 * These are called Write phase and Read phase.
 *
 * StoreGroup often does write phase and, then read phase.
 *
 * ## Write phase
 *
 * StoreGroup notify update timing for each stores.
 *
 * It means that call each `Store#receivePayload()`.
 *
 * ### When
 *
 * - Initialize StoreGroup
 * - A parts of life-cycle during execute UseCase
 * - Force update StoreGroup
 *
 * ### What does store?
 *
 * - Store update own state if needed
 *
 * ### What does not store?
 *
 * - Store should not directly assign to state instead of using `Store#setState`
 *
 * ## Read phase
 *
 * StoreGroup read the state from each stores.
 *
 * It means that call each `Store#getState()`.
 *
 * ### When
 *
 * - Initialize StoreGroup
 * - A parts of life-cycle during execute UseCase
 * - Force update StoreGroup
 * - Some store call `Store#emitChange`
 *
 * ### What does store?
 *
 * - Store return own state
 *
 * ### What does not store?
 *
 * - Does not update own state
 * - Please update own state in write phase
 *
 * ### Notes
 *
 * #### Pull-based: Recompute every time value is needed
 *
 * Pull-based Store has only getState.
 * Just create the state and return it when `getState` is called.
 *
 * #### Push-based: Recompute when a source value changes
 *
 * Push-based Store have to create the state and save it.
 * Just return the state when `getState` is called.
 * It is similar with cache system.
 *
 */

var StoreGroup = exports.StoreGroup = function (_Dispatcher) {
    _inherits(StoreGroup, _Dispatcher);

    /**
     * Initialize this StoreGroup with a stateName-store mapping object.
     *
     * The rule of initializing StoreGroup is that "define the state name of the store".
     *
     * ## Example
     *
     * Initialize with store-state mapping object.
     *
     * ```js
     * class AStore extends Store {
     *     getState() {
     *         return "a value";
     *     }
     * }
     * class BStore extends Store {
     *     getState() {
     *         return "b value";
     *     }
     * }
     * const aStore = new AStore();
     * const bStore = new BStore();
     * const storeGroup = new CQRSStoreGroup({
     *     a: aStore, // stateName: store
     *     b: bStore
     * });
     * console.log(storeGroup.getState());
     * // { a: "a value", b: "b value" }
     * ```
     */
    function StoreGroup(stateStoreMapping) {
        _classCallCheck(this, StoreGroup);

        var _this2 = _possibleConstructorReturn(this, _Dispatcher.call(this));

        _this2.stateStoreMapping = stateStoreMapping;
        // stores that are emitted changed.
        _this2._emitChangedStores = [];
        // stores that are changed compared by previous state.
        _this2._changingStores = [];
        // all functions to release handlers
        _this2._releaseHandlers = [];
        if (process.env.NODE_ENV !== "production") {
            assertConstructorArguments(stateStoreMapping);
        }
        _this2._storeStateMap = (0, _StoreStateMap.createStoreStateMap)(stateStoreMapping);
        // pull stores from mapping if arguments is mapping.
        _this2.stores = _this2._storeStateMap.stores;
        _this2._workingUseCaseMap = new _mapLike2.default();
        _this2._finishedUseCaseMap = new _mapLike2.default();
        _this2._stateCacheMap = new _mapLike2.default();
        // Implementation Note:
        // Dispatch -> pipe -> Store#emitChange() if it is needed
        //          -> this.onDispatch -> If anyone store is changed, this.emitChange()
        // each pipe to dispatching
        _this2.stores.forEach(function (store) {
            // observe Store
            var registerHandler = _this2._registerStore(store);
            _this2._releaseHandlers.push(registerHandler);
            // delegate dispatching
            var pipeHandler = _this2.pipe(store);
            _this2._releaseHandlers.push(pipeHandler);
        });
        // after dispatching, and then emitChange
        _this2._observeDispatchedPayload();
        // default state
        _this2.state = _this2.initializeGroupState(_this2.stores, initializedPayload);
        return _this2;
    }
    /**
     * If exist working UseCase, return true
     */


    /**
     * Return the state object that merge each stores's state
     */
    StoreGroup.prototype.getState = function getState() {
        return this.state;
    };

    StoreGroup.prototype.initializeGroupState = function initializeGroupState(stores, payload) {
        // 1. write in read
        this.writePhaseInRead(stores, payload);
        // 2. read in read
        return this.readPhaseInRead(stores);
    };
    // write phase
    // Each store updates own state


    StoreGroup.prototype.writePhaseInRead = function writePhaseInRead(stores, payload) {
        for (var i = 0; i < stores.length; i++) {
            var store = stores[i];
            // reduce state by prevSate with payload if it is implemented
            if (typeof store.receivePayload === "function") {
                store.receivePayload(payload);
            }
        }
    };
    // read phase
    // Get state from each store


    StoreGroup.prototype.readPhaseInRead = function readPhaseInRead(stores) {
        var groupState = {};
        for (var i = 0; i < stores.length; i++) {
            var store = stores[i];
            var prevState = this._stateCacheMap.get(store);
            var nextState = store.getState();
            // if the prev/next state is same, not update the state.
            var stateName = this._storeStateMap.get(store);
            if (process.env.NODE_ENV !== "production") {
                assert.ok(stateName !== undefined, "Store:" + store.name + " is not registered in constructor.\nBut, " + store.name + "#getState() was called.");
                warningStateIsImmutable(prevState, nextState, store, this._emitChangedStores);
            }
            // the state is not changed, set prevState as state of the store
            // Check shouldStateUpdate
            if (typeof store.shouldStateUpdate === "function") {
                if (!store.shouldStateUpdate(prevState, nextState)) {
                    groupState[stateName] = prevState;
                    continue;
                }
            } else {
                if (prevState === nextState) {
                    groupState[stateName] = prevState;
                    continue;
                }
            }
            // Update cache
            this._stateCacheMap.set(store, nextState);
            // Changing flag On
            this._addChangingStateOfStores(store);
            // Set state
            groupState[stateName] = nextState;
        }
        return groupState;
    };
    /**
     * Use `shouldStateUpdate()` to let StoreGroup know if a event is not affected.
     * The default behavior is to emitChange on every life-cycle change,
     * and in the vast majority of cases you should rely on the default behavior.
     * Default behavior is shallow-equal prev/next state.
     *
     * ## Example
     *
     * If you want to use `Object.is` to equal states, overwrite following.
     *
     * ```js
     * shouldStateUpdate(prevState, nextState) {
     *    return !Object.is(prevState, nextState)
     * }
     * ```
     */


    StoreGroup.prototype.shouldStateUpdate = function shouldStateUpdate(prevState, nextState) {
        return !(0, _shallowEqualObject.shallowEqual)(prevState, nextState);
    };
    /**
     * Emit change if the state is changed.
     * If call with no-arguments, use ChangedPayload by default.
     */


    StoreGroup.prototype.emitChange = function emitChange() {
        this.tryEmitChange();
    };
    // write and read -> emitChange if needed


    StoreGroup.prototype.sendPayloadAndTryEmit = function sendPayloadAndTryEmit(payload) {
        this.writePhaseInRead(this.stores, payload);
        this.tryEmitChange();
    };
    // read -> emitChange if needed


    StoreGroup.prototype.tryEmitChange = function tryEmitChange() {
        this._pruneChangingStateOfStores();
        var nextState = this.readPhaseInRead(this.stores);
        if (!this.shouldStateUpdate(this.state, nextState)) {
            return;
        }
        this.state = nextState;
        // emit changes
        var changingStores = this._changingStores.slice();
        this.emit(CHANGE_STORE_GROUP, changingStores);
        // release changed stores
        this._pruneEmitChangedStore();
    };
    /**
     * Observe changes of the store group.
     *
     * onChange workflow: https://code2flow.com/mHFviS
     */


    StoreGroup.prototype.onChange = function onChange(handler) {
        this.on(CHANGE_STORE_GROUP, handler);
        var releaseHandler = this.removeListener.bind(this, CHANGE_STORE_GROUP, handler);
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    };
    /**
     * Release all events handler.
     * You can call this when no more call event handler
     */


    StoreGroup.prototype.release = function release() {
        this._releaseHandlers.forEach(function (releaseHandler) {
            return releaseHandler();
        });
        this._releaseHandlers.length = 0;
        this._pruneChangingStateOfStores();
    };
    /**
     * register store and listen onChange.
     * If you release store, and do call `release` method.
     */


    StoreGroup.prototype._registerStore = function _registerStore(store) {
        var _this3 = this;

        var onChangeHandler = function onChangeHandler() {
            _this3.addEmitChangedStore(store);
            // if not exist working UseCases, immediate invoke emitChange.
            if (!_this3.existWorkingUseCase) {
                _this3.tryEmitChange();
            }
        };
        if (process.env.NODE_ENV !== "production") {
            onChangeHandler.displayName = store.name + "#onChange->handler";
        }
        return store.onChange(onChangeHandler);
    };
    /**
     * Observe all payload.
     */


    StoreGroup.prototype._observeDispatchedPayload = function _observeDispatchedPayload() {
        var _this4 = this;

        var observeChangeHandler = function observeChangeHandler(payload, meta) {
            if (!meta.isTrusted) {
                _this4.sendPayloadAndTryEmit(payload);
            } else if (payload instanceof _ErrorPayload.ErrorPayload) {
                _this4.sendPayloadAndTryEmit(payload);
            } else if (payload instanceof _WillExecutedPayload.WillExecutedPayload && meta.useCase) {
                _this4._workingUseCaseMap.set(meta.useCase.id, true);
            } else if (payload instanceof _DidExecutedPayload.DidExecutedPayload && meta.useCase) {
                if (meta.isUseCaseFinished) {
                    _this4._finishedUseCaseMap.set(meta.useCase.id, true);
                }
                _this4.sendPayloadAndTryEmit(payload);
            } else if (payload instanceof _CompletedPayload.CompletedPayload && meta.useCase && meta.isUseCaseFinished) {
                _this4._workingUseCaseMap.delete(meta.useCase.id);
                // if the useCase is already finished, doesn't emitChange in CompletedPayload
                // In other word, If the UseCase that return non-promise value, doesn't emitChange in CompletedPayload
                if (_this4._finishedUseCaseMap.has(meta.useCase.id)) {
                    _this4._finishedUseCaseMap.delete(meta.useCase.id);
                    return;
                }
                _this4.sendPayloadAndTryEmit(payload);
            }
        };
        var releaseHandler = this.onDispatch(observeChangeHandler);
        this._releaseHandlers.push(releaseHandler);
    };

    StoreGroup.prototype.addEmitChangedStore = function addEmitChangedStore(store) {
        if (this._emitChangedStores.indexOf(store) === -1) {
            this._emitChangedStores.push(store);
        }
    };

    StoreGroup.prototype._pruneEmitChangedStore = function _pruneEmitChangedStore() {
        this._emitChangedStores = [];
    };

    StoreGroup.prototype._addChangingStateOfStores = function _addChangingStateOfStores(store) {
        if (this._changingStores.indexOf(store) === -1) {
            this._changingStores.push(store);
        }
    };

    StoreGroup.prototype._pruneChangingStateOfStores = function _pruneChangingStateOfStores() {
        this._changingStores = [];
    };

    _createClass(StoreGroup, [{
        key: "existWorkingUseCase",
        get: function get() {
            return this._workingUseCaseMap.size > 0;
        }
    }, {
        key: "isInitializedWithStateNameMap",
        get: function get() {
            return this._storeStateMap.size > 0;
        }
    }]);

    return StoreGroup;
}(_Dispatcher2.Dispatcher);
//# sourceMappingURL=StoreGroup.js.map