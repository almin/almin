// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StoreGroupValidator = undefined;

var _assert = require("assert");

var assert = _interopRequireWildcard(_assert);

var _Dispatcher = require("../Dispatcher");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 StoreGroup

 - must have `#onChange((stores) => {}): void`
 - must have `#getState(): Object`
 - may have `#release(): void`

 */
var StoreGroupValidator = exports.StoreGroupValidator = function () {
  function StoreGroupValidator() {
    _classCallCheck(this, StoreGroupValidator);
  }

  /**
   * validate the instance is StoreGroup-like object
   * Context treat StoreGroup like object as StoreGroup.
   */
  StoreGroupValidator.validateInstance = function validateInstance(storeGroup) {
    assert.ok(storeGroup !== undefined, "store should not be undefined");
    assert.ok(_Dispatcher.Dispatcher.isDispatcher(storeGroup), "storeGroup should inherit CoreEventEmitter");
    assert.ok(typeof storeGroup.onChange === "function", "StoreGroup should have #onChange method");
    assert.ok(typeof storeGroup.getState === "function", "StoreGroup should have #getState method");
    // #release is optional
    assert.ok(typeof storeGroup.release === "undefined" || typeof storeGroup.release === "function", "StoreGroup may have #release method");
  };

  return StoreGroupValidator;
}();
//# sourceMappingURL=StoreGroupValidator.js.map