// LICENSE : MIT
"use strict";
/**
 * Internal implementation
 * @private
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DispatcherPayloadMetaImpl = exports.DispatcherPayloadMetaImpl = function DispatcherPayloadMetaImpl(args) {
    _classCallCheck(this, DispatcherPayloadMetaImpl);

    this.useCase = args.useCase || null;
    this.dispatcher = args.dispatcher === undefined ? null : args.dispatcher;
    this.parentUseCase = args.parentUseCase || null;
    this.timeStamp = Date.now();
    this.isTrusted = args.isTrusted;
    this.isUseCaseFinished = args.isUseCaseFinished !== undefined ? args.isUseCaseFinished : false;
};
//# sourceMappingURL=DispatcherPayloadMeta.js.map