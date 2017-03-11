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
        const includesUseCaseName = childrenLogGroup
        .filter(logGroup => logGroup !== undefined)
        .map(logGroup => logGroup.useCaseName).join(", ");
        const groupTitleSuffix = childrenLogGroup.length > 0 ? `(includes "${includesUseCaseName}")` : "";
        const isIncludedErrorChunk = this._includeErrorChunk(logGroup);
        // x or flag
        const groupMark = isIncludedErrorChunk ? `\u{274C}` : "\u{1F516}";
        const groupTitle = `${groupMark} ${logGroup.title}${groupTitleSuffix}`;
        this.logger.groupCollapsed(groupTitle);
        logGroup.children.forEach(logItem => {
            if (logItem instanceof LogGroup) {
                this.printLogGroup(logItem);
            } else {
                this._outputChunk(logItem);
            }
        });
        if (logGroup.children.length > 1) {
            const takenTime = logGroup.children[logGroup.children.length - 1].timeStamp - logGroup.children[0].timeStamp;
            this.logger.log(`Taken time: ${takenTime}ms`);
        }
        this.logger.groupEnd(groupTitle);
    }


    /**
     * @param {LogChunk} chunk
     * @private
     */
    _outputChunk(chunk) {
        const logs = Array.isArray(chunk.log) ? chunk.log : [chunk.log];
        this._outputToConsole(logs);
    }

    /**
     * output logs
     * @param {*[]} logs
     * @private
     */
    _outputToConsole(logs) {
        if (this._includeErrorChunkLogs(logs)) {
            this.logger.error(...logs);
        } else {
            this.logger.log(...logs);
        }
    }


    /**
     * Is include Error chunk
     * @param {LogGroup} logGroup
     * @returns {boolean}
     * @private
     */
    _includeErrorChunk(logGroup) {
        return logGroup.children.some(chunk => {
            if (chunk instanceof LogGroup) {
                return this._includeErrorChunk(chunk)
            } else {
                return this._includeErrorChunkLogs(chunk.log);
            }
        });
    }

    /**
     * Is log Error instance
     * @param {*|*[]} logs
     * @private
     */
    _includeErrorChunkLogs(logs) {
        if (!Array.isArray(logs)) {
            return logs instanceof Error;
        }
        return logs.some(log => {
            return log instanceof Error;
        });
    }
}