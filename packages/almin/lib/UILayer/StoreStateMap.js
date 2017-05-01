"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StoreStateMap = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createStoreStateMap = createStoreStateMap;

var _mapLike = require("map-like");

var _mapLike2 = _interopRequireDefault(_mapLike);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); } // MIT © 2017 azu


/**
 * TODO: make strong type
 */
var StoreStateMap = exports.StoreStateMap = function (_MapLike) {
    _inherits(StoreStateMap, _MapLike);

    function StoreStateMap() {
        _classCallCheck(this, StoreStateMap);

        return _possibleConstructorReturn(this, _MapLike.apply(this, arguments));
    }

    _createClass(StoreStateMap, [{
        key: "stores",
        get: function get() {
            return this.keys();
        }
    }, {
        key: "stateNames",
        get: function get() {
            return this.values();
        }
    }]);

    return StoreStateMap;
}(_mapLike2.default);
/**
 * Create StateStoreMap from mapping object
 *
 * ## Mapping object
 *
 * - key: state name
 * - value: store instance
 *
 * ```js
 * var mapping = {
 *  "stateName": store
 * }
 * ```
 */


function createStoreStateMap(mappingObject) {
    var map = new StoreStateMap();
    var keys = Object.keys(mappingObject);
    for (var i = 0; i < keys.length; i++) {
        var stateName = keys[i];
        var store = mappingObject[stateName];
        map.set(store, stateName);
    }
    return map;
}
//# sourceMappingURL=StoreStateMap.js.map