// MIT © 2017 azu
"use strict";
import LogGroup from "./LogGroup";
import LogChunk from "./LogChunk";
export default class PrintLogger {
    /**
     * @param {Object|Console} logger
     */
    constructor(logger) {
        this.logger = logger;
    }

    /**
     * @param {LogGroup} logGroup
     */
    printLogGroup(logGroup) {
        const childrenLogGroup = logGroup.children.filter(logItem => logItem instanceof LogGroup);
        const includesUseCaseName = childrenLogGroup.map(logGroup => logGroup.useCaseName).join(", ");
        const groupTitleSuffix = childrenLogGroup.length > 0 ? `(includes "${includesUseCaseName}")` : "";
        const groupTitle = `\u{1F516} ${logGroup.title}${groupTitleSuffix}`;
        this.logger.groupCollapsed(groupTitle);
        logGroup.children.forEach(logItem => {
            if (logItem instanceof LogGroup) {
                this.printLogGroup(logItem);
            } else {
                this._outputChunk(logItem);
            }
        });
        const takenTime = logGroup.children[logGroup.children.length - 1].timeStamp - logGroup.children[0].timeStamp;
        this.logger.log(`Taken time: ${takenTime}ms`);
        this.logger.groupEnd(groupTitle);
    }

    /**
     * @param {LogChunk} chunk
     * @private
     */
    _outputChunk(chunk) {
        if (Array.isArray(chunk.log)) {
            this.logger.log(...chunk.log);
        } else {
            this._outputToConsole(chunk.log);
        }
    }

    /**
     * @param {string|log
     * @private
     */
    _outputToConsole(log) {
        if (log instanceof Error) {
            this.logger.error(log);
        } else {
            this.logger.log(log);
        }
    }
}