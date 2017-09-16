// LICENSE : MIT
"use strict";
const assert = require("assert");
import Color from "./value/Color";
import RGBAColor from "./value/RGBAColor";
import ColorHistory from "./ColorHistory";
const randomColor = require("randomcolor");
const uuid = require("uuid");
export default class ColorMixer {
    constructor() {
        this.id = uuid();
        this.colorHisotry = new ColorHistory();
    }

    /**
     * @returns {ColorHistory}
     */
    getHistory() {
        return this.colorHisotry;
    }

    /**
     * @returns {Color|undefined}
     */
    currentColor() {
        return this.colorHisotry.lastUsedColor();
    }

    /**
     * next random Color without duplicated
     * @returns {Color}
     */
    nextColor() {
        // eslint-disable-next-line
        while (true) {
            const hexCode = randomColor();
            const color = new Color({ hexCode });
            if (this.colorHisotry.isAlreadyUsedColor(color)) {
                continue;
            }
            return color;
        }
    }

    /**
     * @param {Color} color
     */
    setColor(color) {
        this.colorHisotry.recordColor(color);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @returns {RGBAColor}
     */
    createColorFromPosition({ x, y, width, height }) {
        assert(typeof x === "number" && typeof y === "number");
        assert(typeof width === "number" && typeof height === "number");
        const alpha = y / height;
        const xTen = x / width * 255;
        const yTen = y / height * 255;
        const rgba = `rgba(${parseInt(xTen, 10)}, ${parseInt(yTen, 10)}, ${parseInt(xTen, 10)}, ${alpha})`;
        return new RGBAColor({ rgba });
    }

    setWallColor(color) {}
}
