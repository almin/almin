"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * UseCase incremental count is for Unique ID.
 */
var _UseCaseCount = 0;
/**
 * create new id
 */
var generateNewId = exports.generateNewId = function generateNewId() {
  _UseCaseCount++;
  return String(_UseCaseCount);
};
//# sourceMappingURL=UseCaseIdGenerator.js.map