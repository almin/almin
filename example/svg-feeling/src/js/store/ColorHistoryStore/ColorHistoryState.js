// LICENSE : MIT
"use strict";
import ColorHistory from "../../domain/ColorHistory";
export default class ColorHistoryState {
    /**
     * @param {ColorHistory} history
     */
    constructor(history) {
        this.history = history;
    }
}