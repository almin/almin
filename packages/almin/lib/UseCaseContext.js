// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UseCaseContext = undefined;

var _UseCase = require("./UseCase");

var _UseCaseExecutor = require("./UseCaseExecutor");

var _FunctionalUseCase = require("./FunctionalUseCase");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = require("assert");
/**
 * Maybe, `UseCaseContext` is invisible from Public API.
 *
 * `UseCase#context` return UseCaseContext insteadof Context.
 * It has limitation as against to Context.
 * Because, `UseCaseContext` is for `UseCase`, is not for `Context`.
 *
 * ```js
 * class ParentUseCase extends UseCase {
 *     execute() {
 *         this.context; // <= This is a instance of UseCaseContext
 *     }
 * }
 * ```
 */

var UseCaseContext = function () {
    /**
     * `dispatcher` is often parent `UseCase`.
     * The user can not create this instance directly.
     * The user can access this via `UseCase#context`
     *
     * **internal**
     */
    function UseCaseContext(dispatcher) {
        _classCallCheck(this, UseCaseContext);

        this._dispatcher = dispatcher;
    }

    UseCaseContext.prototype.useCase = function useCase(_useCase) {
        if (process.env.NODE_ENV !== "production") {
            assert(_useCase !== this._dispatcher, "the useCase(" + _useCase + ") should not equal this useCase(" + this._dispatcher + ")");
        }
        if (_UseCase.UseCase.isUseCase(_useCase)) {
            return new _UseCaseExecutor.UseCaseExecutor({
                useCase: _useCase,
                parent: _UseCase.UseCase.isUseCase(this._dispatcher) ? this._dispatcher : null,
                dispatcher: this._dispatcher
            });
        } else if (typeof _useCase === "function") {
            if (process.env.NODE_ENV !== "production") {
                // When pass UseCase constructor itself, throw assertion error
                assert.ok(Object.getPrototypeOf && Object.getPrototypeOf(_useCase) !== _UseCase.UseCase, "Context#useCase argument should be instance of UseCase.\nThe argument is UseCase constructor itself: " + _useCase);
            }
            // function to be FunctionalUseCase
            var functionalUseCase = new _FunctionalUseCase.FunctionalUseCase(_useCase, this._dispatcher);
            return new _UseCaseExecutor.UseCaseExecutor({
                useCase: functionalUseCase,
                parent: _UseCase.UseCase.isUseCase(this._dispatcher) ? this._dispatcher : null,
                dispatcher: this._dispatcher
            });
        }
        throw new Error("UseCaseContext#useCase argument should be UseCase: " + _useCase);
    };

    return UseCaseContext;
}();

exports.UseCaseContext = UseCaseContext;
//# sourceMappingURL=UseCaseContext.js.map