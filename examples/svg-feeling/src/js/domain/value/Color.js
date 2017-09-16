// LICENSE : MIT
"use strict";
export default class Color {
    constructor({ hexCode }) {
        this.hexCode = hexCode;
    }

    /**
     * is equal to {@link color}
     * @param {Color} color
     * @returns {boolean}
     */
    isEqualColor(color) {
        return this.hexCode === color.hexCode;
    }
}
