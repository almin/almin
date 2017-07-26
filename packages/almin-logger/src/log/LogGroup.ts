// MIT © 2017 azu
"use strict";
import { LogChunk } from "./LogChunk";
import { LogChildItem } from "./LogChildItem";
export interface LogGroupArgs {
    title: string;
    useCaseName?: string;
    isTransaction?: boolean;
}
export class LogGroup {
    private _buffer: ReadonlyArray<LogChildItem>;
    title: string;
    useCaseName: string | undefined;
    isTransaction: boolean;
    /**
     * @type {string} title
     * @type {string} [useCaseName]
     * @type {boolean} [isTransaction]
     */
    constructor({ title, useCaseName, isTransaction }: LogGroupArgs) {
        this.title = title;
        this.useCaseName = useCaseName;
        this.isTransaction = isTransaction || false;
        /**
         * @type  {LogChunk|LogGroup[]}
         * @private
         */
        this._buffer = [];
    }

    /**
     * @returns {LogChunk|LogGroup[]}
     */
    get children() {
        return this._buffer;
    }

    addChunk(chunk: LogChunk) {
        this._buffer = this._buffer.concat(chunk);
    }

    addGroup(group: LogGroup) {
        this._buffer = this._buffer.concat(group);
    }
}
