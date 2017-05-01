"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UseCaseInstanceMap = undefined;

var _mapLike = require("map-like");

var _mapLike2 = _interopRequireDefault(_mapLike);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*

## UseCase instance lifecycle

Each UseCase instance is managed by UseCaseInstanceMap.

P: Parent UseCase
C: Child UseCase
Add: Add instance to UseCaseInstanceMap
Delete: Remove instance from UseCaseInstanceMap

    Add P         Delete P   Delete C
    |---------------|          |
    P    |                     |
         C---------------------|
      Add C              |
                         |
                     Point X

If C refer to P on `Point X`, it will not be working correctly.
Almin will say that `This P(parent UseCase) is already released!"

See also https://almin.js.org/docs/warnings/usecase-is-already-released.html
 */
/**
 * This Map maintains a mapping instance of UseCase
 * A UseCase will execute and add it to this map.
 * A UseCase was completed and remove it from this map.
 */
var UseCaseInstanceMap = exports.UseCaseInstanceMap = new _mapLike2.default();
//# sourceMappingURL=UseCaseInstanceMap.js.map