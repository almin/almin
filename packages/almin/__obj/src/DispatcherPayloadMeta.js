// LICENSE : MIT
"use strict";
/**
 * Internal implementation
 * @private
 */
export class DispatcherPayloadMetaImpl {
    constructor(args) {
        this.useCase = args.useCase || null;
        this.dispatcher = (args.dispatcher === undefined) ? null : args.dispatcher;
        this.parentUseCase = args.parentUseCase || null;
        this.timeStamp = Date.now();
        this.isTrusted = args.isTrusted;
        this.isUseCaseFinished = args.isUseCaseFinished !== undefined ? args.isUseCaseFinished : false;
    }
}
