// MIT © 2017 azu
"use strict";
export default class LogGroup {
    /**
     * @type {string} title
     * @type {string} [useCaseName]
     */
    constructor({title, useCaseName}) {
        this.title = title;
        this.useCaseName = useCaseName;
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

    addChunk(chunk) {
        this._buffer.push(chunk);
    }

    addGroup(group) {
        this._buffer.push(group);
    }
}