// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DidExecutedPayload = exports.TYPE = undefined;
exports.isDidExecutedPayload = isDidExecutedPayload;

var _Payload2 = require("./Payload");

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
var TYPE = exports.TYPE = "ALMIN__DID_EXECUTED_EACH_USECASE__";

var DidExecutedPayload = exports.DidExecutedPayload = function (_Payload) {
    _inherits(DidExecutedPayload, _Payload);

    function DidExecutedPayload(_ref) {
        var value = _ref.value;

        _classCallCheck(this, DidExecutedPayload);

        var _this = _possibleConstructorReturn(this, _Payload.call(this, { type: TYPE }));

        _this.value = value;
        return _this;
    }

    return DidExecutedPayload;
}(_Payload2.Payload);

function isDidExecutedPayload(v) {
    return v.type === TYPE;
}
//# sourceMappingURL=DidExecutedPayload.js.map