// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ErrorPayload = exports.TYPE = undefined;
exports.isErrorPayload = isErrorPayload;

var _Payload2 = require("./Payload");

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

/**
 *  XXX: This is exported for an unit testing.
 *  DO NOT USE THIS in your application.
 */
var TYPE = exports.TYPE = "ALMIN__ErrorPayload__";
/**
 * This payload is executed
 */

var ErrorPayload = exports.ErrorPayload = function (_Payload) {
    _inherits(ErrorPayload, _Payload);

    function ErrorPayload(_ref) {
        var error = _ref.error;

        _classCallCheck(this, ErrorPayload);

        var _this = _possibleConstructorReturn(this, _Payload.call(this, { type: TYPE }));

        _this.error = error;
        return _this;
    }

    return ErrorPayload;
}(_Payload2.Payload);

function isErrorPayload(v) {
    return v.type === TYPE;
}
//# sourceMappingURL=ErrorPayload.js.map