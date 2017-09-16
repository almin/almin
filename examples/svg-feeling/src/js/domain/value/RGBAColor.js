// LICENSE : MIT
"use strict";
export default class RGBAColor {
    constructor({ rgba }) {
        this.rgba = rgba;
    }

    /**
     * is equal to {@link color}
     * @param {RGBAColor} color
     * @returns {boolean}
     */
    isEqualColor(color) {
        return this.rgba === color.rgba;
    }
}
