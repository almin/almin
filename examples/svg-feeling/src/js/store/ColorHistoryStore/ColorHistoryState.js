// LICENSE : MIT
"use strict";
import ColorHistory from "../../domain/ColorHistory";
export default class ColorHistoryState {
    constructor({ colorList }) {
        this.colorList = colorList;
    }
    /**
     *
     * @param {ColorHistory} history
     */
    update(history) {
        return new ColorHistoryState({
            colorList: history.getAllColorList()
        });
    }
}
