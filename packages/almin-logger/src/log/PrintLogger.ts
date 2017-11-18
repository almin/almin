// MIT © 2017 azu
"use strict";
import { LogGroup } from "./LogGroup";
import { LogChunk } from "./LogChunk";
import { LogChildItem } from "./LogChildItem";

export class PrintLogger {
    logger: any | Console;

    /**
     * @param {Object|Console} logger
     */
    constructor(logger: any) {
        this.logger = logger;
    }

    /**
     * @param {LogGroup} logGroup
     */
    printLogGroup(logGroup: LogGroup) {
        const childrenLogGroup = logGroup.children.filter(logItem => logItem instanceof LogGroup) as LogGroup[];
        const includesUseCaseName = childrenLogGroup
            .filter(logGroup => logGroup !== undefined)
            .map(logGroup => logGroup.useCaseName)
            .join(", ");
        const groupTitleSuffix = childrenLogGroup.length > 0 ? `(includes "${includesUseCaseName}")` : "";
        /**
         * x(failure) or flag(success) or rocket(transaction)
         * @param {LogGroup} logGroup
         * @returns {string}
         */
        const getGroupMark = (logGroup: LogGroup) => {
            const isIncludedErrorChunk = this._includeErrorChunk(logGroup);
            if (isIncludedErrorChunk) {
                return `\u{274C}`; // x
            } else if (logGroup.isTransaction) {
                return `\u{1F680}`;
            } else {
                return "\u{1F516}";
            }
        };
        const groupMark = getGroupMark(logGroup);
        const groupTitle = `${groupMark} ${logGroup.title}${groupTitleSuffix}`;
        this.logger.groupCollapsed(groupTitle);
        logGroup.children.forEach(logItem => {
            if (logItem instanceof LogGroup) {
                this.printLogGroup(logItem);
            } else {
                this._outputChunk(logItem);
            }
        });

        /**
         *
         * @param {LogGroup|LogChunk} log
         * @param {"first"|"last"} direction
         * @returns {number}
         */
        const getTimeStamp = (log: LogChildItem, direction?: "first" | "last"): number => {
            if (log instanceof LogGroup) {
                if (direction === "last") {
                    const lastItem = log.children[log.children.length - 1];
                    return getTimeStamp(lastItem);
                } else {
                    const firstItem = log.children[0];
                    return getTimeStamp(firstItem);
                }
            } else {
                return log.timeStamp;
            }
        };
        if (logGroup.children.length > 1) {
            const firstItemTimeStamp = getTimeStamp(logGroup, "first");
            const lastItemTimeStamp = getTimeStamp(logGroup, "last");
            const takenTime = lastItemTimeStamp - firstItemTimeStamp;
            this.logger.log(`Taken time: ${takenTime}ms`);
        }
        this.logger.groupEnd(groupTitle);
    }

    /**
     * @param {LogChunk} chunk
     * @private
     */
    _outputChunk(chunk: LogChunk) {
        const logs = Array.isArray(chunk.log) ? chunk.log : [chunk.log];
        this._outputToConsole(logs);
    }

    /**
     * output logs
     * @param {*[]} logs
     * @private
     */
    _outputToConsole(logs: Array<any>) {
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
    _includeErrorChunk(logGroup: LogGroup): boolean {
        return logGroup.children.some(chunk => {
            if (chunk instanceof LogGroup) {
                return this._includeErrorChunk(chunk);
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
    _includeErrorChunkLogs(logs: Array<any> | any) {
        if (!Array.isArray(logs)) {
            return logs instanceof Error;
        }
        return logs.some(log => {
            return log instanceof Error;
        });
    }
}
