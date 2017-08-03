// LICENSE : MIT
"use strict";
import Color from "./value/Color";

const uuid = require("uuid");
export default class ColorHistory {
    /**
     * @param {Color} [initialColor]
     */
    constructor(initialColor) {
        this.id = uuid();
        this._history = initialColor ? [initialColor] : [];
    }

    getAllColorList() {
        return this._history;
    }

    /**
     * @param {Color} color
     * @returns {boolean}
     */
    isAlreadyUsedColor(color) {
        return this._history.some(historyColor => {
            return historyColor.isEqualColor(color);
        });
    }

    /**
     * @param {Color} color
     */
    recordColor(color) {
        this._history = this._history.concat(color);
    }

    /**
     * @returns {Color|undefined}
     */
    lastUsedColor() {
        return this._history[this._history.length - 1];
    }

    /**
     * @param colorHistory
     * @returns {boolean}
     */
    isEqual(colorHistory) {
        return this.id === colorHistory.id && this._history.length === colorHistory._history.length;
    }
}
